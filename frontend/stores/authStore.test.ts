import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./authStore";

const sampleUser = {
  id: 1,
  email: "admin@test.com",
  full_name: "Admin User",
  is_admin: true,
  company_id: 10,
  company_name: "TestCo",
};

describe("authStore", () => {
  beforeEach(() => {
    // Reset store between tests
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
    });
  });

  it("starts with no tokens and no user", () => {
    const s = useAuthStore.getState();
    expect(s.accessToken).toBeNull();
    expect(s.refreshToken).toBeNull();
    expect(s.user).toBeNull();
  });

  it("setTokens stores both access and refresh tokens", () => {
    useAuthStore.getState().setTokens("access-1", "refresh-1");
    const s = useAuthStore.getState();
    expect(s.accessToken).toBe("access-1");
    expect(s.refreshToken).toBe("refresh-1");
  });

  it("setUser stores the user object", () => {
    useAuthStore.getState().setUser(sampleUser);
    expect(useAuthStore.getState().user).toEqual(sampleUser);
  });

  it("setUser(null) clears the user", () => {
    useAuthStore.getState().setUser(sampleUser);
    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("logout clears tokens AND user", () => {
    useAuthStore.getState().setTokens("a", "r");
    useAuthStore.getState().setUser(sampleUser);
    useAuthStore.getState().logout();

    const s = useAuthStore.getState();
    expect(s.accessToken).toBeNull();
    expect(s.refreshToken).toBeNull();
    expect(s.user).toBeNull();
  });

  it("full login flow: set tokens + user, then logout", () => {
    useAuthStore.getState().setTokens("access-x", "refresh-x");
    useAuthStore.getState().setUser(sampleUser);

    let s = useAuthStore.getState();
    expect(s.accessToken).toBe("access-x");
    expect(s.refreshToken).toBe("refresh-x");
    expect(s.user?.email).toBe("admin@test.com");

    useAuthStore.getState().logout();
    s = useAuthStore.getState();
    expect(s.accessToken).toBeNull();
    expect(s.refreshToken).toBeNull();
    expect(s.user).toBeNull();
  });
});
