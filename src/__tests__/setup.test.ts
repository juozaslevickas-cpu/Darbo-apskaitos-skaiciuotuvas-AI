import { describe, it, expect } from 'vitest';

describe('Project setup', () => {
  it('should have vitest configured correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should resolve @ alias', async () => {
    const constants = await import('@/config/constants');
    expect(constants.DK_LIMITS).toBeDefined();
    expect(constants.DK_LIMITS.DEFAULT_WEEKLY_NORM).toBe(40);
  });
});
