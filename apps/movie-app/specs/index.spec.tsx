import Page from '../src/app/[locale]/page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('Page', () => {
  it('should render successfully', async () => {
    const params = Promise.resolve({ locale: 'en' });
    const result = await Page({ params });
    expect(result).toBeUndefined();
  });
});
