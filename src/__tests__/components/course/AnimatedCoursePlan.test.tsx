import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AnimatedCoursePlan from '@/components/course/AnimatedCoursePlan';

// Mock the intersection observer
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
global.IntersectionObserver = mockIntersectionObserver;

// Mock data for testing
const mockPlanData = {
  simple: `Ce module contient 3 parties :

### DÉCOUVRIR
a) Introduction générale, 2'30
b) Contexte et enjeux

### APPRENDRE  
a) Méthodes principales, 5'45
b) Cas pratiques

### ANCRER
a) Exercices d'application, 10'20
b) Quiz final`,

  complex: `Ce module contient 4 parties :

### DÉCOUVRIR
a) Storytelling : Vidéo "Visualisation et augmentation salariale", 3'23
b) Vidéo d'expert : "Les techniques avancées"
c) Documents téléchargeables disponibles

### APPRENDRE
a) Méthodes VRAI/FAUX pour l'évaluation, 8'15
b) Tutorial YouTube sur les bases
c) Quiz interactif

### ANCRER
a) Exercices pratiques, 12'30
b) Évaluation finale

### RESSOURCES COMPLÉMENTAIRES
a) Liens utiles
b) Documentation complémentaire`,

  withSpecialChars: `Formation spécialisée :

### DÉCOUVRIR
a) Introduction : "Techniques d'amélioration", 4'32
b) Contexte & objectifs spéciaux
c) Vue d'ensemble (complète)

### APPRENDRE
a) Méthodologie "step-by-step" avec guillemets, 6'45
b) Cas d'usage & exemples pratiques
c) Évaluation VRAI/FAUX interactive`,
};

describe('AnimatedCoursePlan', () => {
  const defaultProps = {
    plan_md: mockPlanData.simple,
    locale: 'fr' as const,
    courseId: '123',
  };

  describe('Basic Rendering', () => {
    it('renders the course plan title', () => {
      render(<AnimatedCoursePlan {...defaultProps} />);
      expect(screen.getByText('Programme de la formation')).toBeInTheDocument();
    });

    it('renders the course plan title in English', () => {
      render(<AnimatedCoursePlan {...defaultProps} locale="en" />);
      expect(screen.getByText('Course Curriculum')).toBeInTheDocument();
    });

    it('renders the first line subtitle', async () => {
      render(<AnimatedCoursePlan {...defaultProps} />);
      // The first line should be extracted and displayed
      expect(screen.getByText('Ce module contient 3 parties :')).toBeInTheDocument();
    });

    it('renders section headers', () => {
      render(<AnimatedCoursePlan {...defaultProps} />);
      expect(screen.getByText('DÉCOUVRIR')).toBeInTheDocument();
      expect(screen.getByText('APPRENDRE')).toBeInTheDocument();
      expect(screen.getByText('ANCRER')).toBeInTheDocument();
    });
  });

  describe('Content Processing', () => {
    it('processes simple content correctly', () => {
      render(<AnimatedCoursePlan {...defaultProps} />);
      
      // Check that content is broken into sections
      expect(screen.getByText('Introduction générale, 2\'30')).toBeInTheDocument();
      expect(screen.getByText('Contexte et enjeux')).toBeInTheDocument();
      expect(screen.getByText('Méthodes principales, 5\'45')).toBeInTheDocument();
    });

    it('handles complex content with special patterns', () => {
      render(<AnimatedCoursePlan {...defaultProps} plan_md={mockPlanData.complex} />);
      
      // Should render video-related content
      expect(screen.getByText(/Storytelling.*Vidéo/)).toBeInTheDocument();
      expect(screen.getByText(/Vidéo d'expert/)).toBeInTheDocument();
      
      // Should render VRAI/FAUX content
      expect(screen.getByText(/VRAI\/FAUX/)).toBeInTheDocument();
      
      // Should render YouTube content
      expect(screen.getByText(/YouTube/)).toBeInTheDocument();
    });

    it('handles content with quotes and special characters', () => {
      render(<AnimatedCoursePlan {...defaultProps} plan_md={mockPlanData.withSpecialChars} />);
      
      // Should handle quoted content
      expect(screen.getByText(/Techniques d'amélioration/)).toBeInTheDocument();
      expect(screen.getByText(/step-by-step/)).toBeInTheDocument();
      expect(screen.getByText(/Cas d'usage & exemples/)).toBeInTheDocument();
    });
  });

  describe('Icon Integration', () => {
    it('renders appropriate section icons', () => {
      const { container } = render(<AnimatedCoursePlan {...defaultProps} />);
      
      // Check for icon elements (they should be SVG elements from Lucide)
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('applies correct styling for gradients when provided', () => {
      render(
        <AnimatedCoursePlan
          {...defaultProps}
          gradientFromLight="#FF0000"
          gradientToLight="#00FF00"
          gradientFromDark="#0000FF"
          gradientToDark="#FFFF00"
          onLight="#000000"
          onDark="#FFFFFF"
        />
      );
      
      // Should inject custom CSS for gradients
      const styleElements = document.querySelectorAll('style');
      expect(styleElements.length).toBeGreaterThan(0);
      
      // Check that the style contains gradient information
      const hasGradientStyle = Array.from(styleElements).some(style =>
        style.textContent?.includes('linear-gradient')
      );
      expect(hasGradientStyle).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for sections', () => {
      render(<AnimatedCoursePlan {...defaultProps} />);
      
      // Check for role attributes
      const articles = screen.getAllByRole('article');
      expect(articles.length).toBeGreaterThan(0);
      
      // Check that sections have aria-label
      articles.forEach(article => {
        expect(article).toHaveAttribute('aria-label');
      });
    });

    it('has proper heading hierarchy', () => {
      render(<AnimatedCoursePlan {...defaultProps} />);
      
      // Main title should be h2
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Programme de la formation');
      
      // Section titles should be h3
      const h3Elements = screen.getAllByRole('heading', { level: 3 });
      expect(h3Elements.length).toBeGreaterThan(0);
      expect(h3Elements.some(h3 => h3.textContent?.includes('DÉCOUVRIR'))).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('handles empty plan content gracefully', () => {
      render(<AnimatedCoursePlan {...defaultProps} plan_md="" />);
      
      // Should still render the main title
      expect(screen.getByText('Programme de la formation')).toBeInTheDocument();
    });

    it('handles malformed markdown gracefully', () => {
      const malformedContent = `Malformed content without proper sections
      Some random text
      ### Incomplete section`;
      
      expect(() => {
        render(<AnimatedCoursePlan {...defaultProps} plan_md={malformedContent} />);
      }).not.toThrow();
    });

    it('handles content with only text and no sections', () => {
      const textOnlyContent = `Just some plain text content without any markdown sections.
      This should still render without errors.`;
      
      render(<AnimatedCoursePlan {...defaultProps} plan_md={textOnlyContent} />);
      expect(screen.getByText(/Just some plain text/)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not create excessive DOM nodes for large content', () => {
      // Create large content
      const largeContent = `Ce module contient 10 parties :

${Array.from({ length: 10 }, (_, i) => `
### SECTION ${i + 1}
${Array.from({ length: 5 }, (_, j) => `${String.fromCharCode(97 + j)}) Item ${j + 1}, ${Math.floor(Math.random() * 60)}'${Math.floor(Math.random() * 60)}`).join('\n')}
`).join('')}`;

      const { container } = render(<AnimatedCoursePlan {...defaultProps} plan_md={largeContent} />);
      
      // Should not create an excessive number of DOM nodes
      const allElements = container.querySelectorAll('*');
      expect(allElements.length).toBeLessThan(1000); // Reasonable upper bound
    });
  });
});