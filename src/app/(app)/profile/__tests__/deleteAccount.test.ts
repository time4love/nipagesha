/**
 * Unit tests for deleteAccount server action (GDPR / Right to be forgotten).
 * Mocks Supabase server client and admin client to assert behavior without hitting real APIs.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";

const mockUserId = "test-user-uuid-123";

const mockCreateClient = vi.fn();
const mockAdminStorageFrom = vi.fn();
const mockAdminAuthDeleteUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockCreateClient(),
}));

const mockFrom = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  adminClient: {
    storage: {
      from: (bucket: string) => mockAdminStorageFrom(bucket),
    },
    from: (table: string) => mockFrom(table),
    auth: {
      admin: {
        deleteUser: (userId: string) => mockAdminAuthDeleteUser(userId),
      },
    },
  },
}));

async function getDeleteAccountAction() {
  const mod = await import("../actions");
  return mod.deleteAccount;
}

function setupAuthenticatedUser() {
  mockCreateClient.mockResolvedValue({
    auth: {
      getUser: () =>
        Promise.resolve({
          data: { user: { id: mockUserId } },
          error: null,
        }),
    },
  });
}

function setupUnauthenticated() {
  mockCreateClient.mockResolvedValue({
    auth: {
      getUser: () =>
        Promise.resolve({
          data: { user: null },
          error: null,
        }),
    },
  });
}

function setupAdminFromSuccess() {
  mockFrom.mockReturnValue({
    select: () => ({
      eq: () => Promise.resolve({ data: [], error: null }),
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: null }),
      in: () => Promise.resolve({ error: null }),
    }),
  });
}

function setupStorageListEmpty() {
  mockAdminStorageFrom.mockImplementation((bucket: string) => ({
    list: () => Promise.resolve({ data: [], error: null }),
    remove: () => Promise.resolve({ error: null }),
  }));
}

function setupStorageListNotFound() {
  mockAdminStorageFrom.mockImplementation(() => ({
    list: () =>
      Promise.resolve({
        data: null,
        error: { message: "Bucket not found" },
      }),
    remove: () => Promise.resolve({ error: null }),
  }));
}

function setupStorageListThenRemove() {
  mockAdminStorageFrom.mockImplementation(() => ({
    list: () =>
      Promise.resolve({
        data: [{ name: "file.jpg", id: "f1" }],
        error: null,
      }),
    remove: () => Promise.resolve({ error: null }),
  }));
}

function setupDeleteUserSuccess() {
  mockAdminAuthDeleteUser.mockResolvedValue({ error: null });
}

function setupDeleteUserFailure(message: string) {
  mockAdminAuthDeleteUser.mockResolvedValue({
    error: { message },
  });
}

describe("deleteAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupAdminFromSuccess();
    setupStorageListEmpty();
    setupDeleteUserSuccess();
  });

  test("returns Unauthorized when user is not logged in", async () => {
    setupUnauthenticated();
    const deleteAccount = await getDeleteAccountAction();
    const result = await deleteAccount();
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockAdminAuthDeleteUser).not.toHaveBeenCalled();
  });

  test("returns success when user is logged in and all steps succeed", async () => {
    setupAuthenticatedUser();
    const deleteAccount = await getDeleteAccountAction();
    const result = await deleteAccount();
    expect(result).toEqual({ success: true });
    expect(mockAdminAuthDeleteUser).toHaveBeenCalledWith(mockUserId);
  });

  test("returns error when auth.admin.deleteUser fails", async () => {
    setupAuthenticatedUser();
    setupDeleteUserFailure("User not found");
    const deleteAccount = await getDeleteAccountAction();
    const result = await deleteAccount();
    expect(result).toEqual({ success: false, error: "User not found" });
  });

  test("calls storage from for both secure-media and public-media buckets", async () => {
    setupAuthenticatedUser();
    const deleteAccount = await getDeleteAccountAction();
    await deleteAccount();
    expect(mockAdminStorageFrom).toHaveBeenCalledWith("secure-media");
    expect(mockAdminStorageFrom).toHaveBeenCalledWith("public-media");
  });
});

describe("deleteAccount — storage errors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupAdminFromSuccess();
    setupDeleteUserSuccess();
  });

  test("continues when storage list returns bucket-not-found (no files to delete)", async () => {
    setupAuthenticatedUser();
    setupStorageListNotFound();
    const deleteAccount = await getDeleteAccountAction();
    const result = await deleteAccount();
    expect(result).toEqual({ success: true });
    expect(mockAdminAuthDeleteUser).toHaveBeenCalledWith(mockUserId);
  });
});
