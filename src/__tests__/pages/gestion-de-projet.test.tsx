import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import ProjectManagementPage from '@/app/[locale]/gestion-de-projet/page';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock the directus lib
jest.mock('@/lib/directus', () => ({
  getCoursesListUrl: jest.fn((locale: string) => `/${locale}/courses`),
}));

const mockMessages = {
  navigation: {
    projectManagement: 'Gestion de projet',
  },
};

const renderWithIntl = (component: React.ReactElement, locale = 'fr') => {
  return render(
    <NextIntlClientProvider locale={locale} messages={mockMessages}>
      {component}
    </NextIntlClientProvider>
  );
};

describe('Project Management Page', () => {
  it('should render the course description with bullet points', async () => {
    // Mock the params
    const mockParams = Promise.resolve({ locale: 'fr' });
    
    const Component = await ProjectManagementPage({ params: mockParams });
    
    renderWithIntl(Component);

    // Check if the main heading is present
    expect(screen.getByText('Dans cette formation en ligne, vous découvrirez comment :')).toBeInTheDocument();

    // Check if bullet point content is present
    expect(screen.getByText(/Co-décider, co-créer et co-construire des projets ensemble/)).toBeInTheDocument();
    expect(screen.getByText(/Faire émerger le meilleur de l'intelligence collective/)).toBeInTheDocument();
    expect(screen.getByText(/Créer un engagement plus fort de l'équipe/)).toBeInTheDocument();
    expect(screen.getByText(/Stimuler la motivation et la créativité/)).toBeInTheDocument();
    expect(screen.getByText(/Développer des qualités humaines/)).toBeInTheDocument();
  });

  it('should render bullet points as list items', async () => {
    const mockParams = Promise.resolve({ locale: 'fr' });
    const Component = await ProjectManagementPage({ params: mockParams });
    
    renderWithIntl(Component);

    // Check if the content is rendered as a list
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(5); // Should have 5 bullet points

    // Check if bullet points are present (• character)
    const bulletPoints = screen.getAllByText('•');
    expect(bulletPoints).toHaveLength(5);
  });

  it('should not have box styling on the hero section', async () => {
    const mockParams = Promise.resolve({ locale: 'fr' });
    const Component = await ProjectManagementPage({ params: mockParams });
    
    const { container } = renderWithIntl(Component);

    // Check that there's no element with both rounded and shadow classes (which would indicate a box)
    const boxElements = container.querySelectorAll('.rounded-lg.shadow-lg');
    const heroSection = container.querySelector('h2')?.closest('div');
    
    // The hero section should not have box styling
    expect(heroSection).not.toHaveClass('bg-white', 'rounded-lg', 'shadow-lg');
  });

  it('should render English version correctly', async () => {
    const mockParams = Promise.resolve({ locale: 'en' });
    const Component = await ProjectManagementPage({ params: mockParams });
    
    renderWithIntl(Component, 'en');

    expect(screen.getByText('In this online training, you will discover how to:')).toBeInTheDocument();
    expect(screen.getByText(/Co-decide, co-create and co-build projects together/)).toBeInTheDocument();
  });
});