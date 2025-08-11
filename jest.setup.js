// eslint-disable-next-line @typescript-eslint/no-var-requires
require("@testing-library/jest-dom");

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock TanStack Query
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
