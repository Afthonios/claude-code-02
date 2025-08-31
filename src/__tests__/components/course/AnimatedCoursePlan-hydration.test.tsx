import React from 'react';
import { render, renderToString } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AnimatedCoursePlan from '@/components/course/AnimatedCoursePlan';
import { JSDOM } from 'jsdom';

// Mock intersection observer
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});

// Test data that commonly causes hydration issues
const problematicContent = `Ce module contient 4 parties :

### DÉCOUVRIR
a) Storytelling : Vidéo "Visualisation et augmentation salariale", 3'23
b) Vidéo d'expert avec des "guillemets" et caractères spéciaux, 5'47
c) Documents téléchargeables & ressources complémentaires

### APPRENDRE
a) Méthodes VRAI/FAUX pour l'évaluation interactive, 8'15
b) Tutorial YouTube sur les techniques avancées
c) Quiz avec timer 12'30 et validation

### ANCRER
a) Exercices pratiques & cas d'usage réels, 15'45
b) Évaluation finale avec feedback instantané
c) Certification et badge de completion

### RESSOURCES COMPLÉMENTAIRES
a) Liens externes vers sites partenaires
b) Documentation PDF téléchargeable
c) Vidéos complémentaires sur YouTube, 20'10`;

describe('AnimatedCoursePlan Hydration Tests', () => {
  let originalIntersectionObserver: any;
  
  beforeEach(() => {
    originalIntersectionObserver = global.IntersectionObserver;
    global.IntersectionObserver = mockIntersectionObserver;
  });

  afterEach(() => {
    global.IntersectionObserver = originalIntersectionObserver;
    vi.clearAllMocks();
  });

  const defaultProps = {
    plan_md: problematicContent,
    locale: 'fr' as const,
    courseId: '19',
  };

  describe('Server-Side Rendering Consistency', () => {
    it('produces consistent output on server-side render', () => {
      // Simulate server environment
      const serverRender1 = renderToString(<AnimatedCoursePlan {...defaultProps} />);
      const serverRender2 = renderToString(<AnimatedCoursePlan {...defaultProps} />);
      
      // Server-side renders should be identical
      expect(serverRender1).toBe(serverRender2);
    });

    it('handles complex content consistently on server', () => {
      const complexProps = {
        ...defaultProps,
        gradientFromLight: '#EBE2E0',
        gradientToLight: '#F5F1EF',
        gradientFromDark: '#2D2A28',
        gradientToDark: '#1A1817',
        onLight: '#8B4513',
        onDark: '#DEB887',
      };

      const serverRender1 = renderToString(<AnimatedCoursePlan {...complexProps} />);
      const serverRender2 = renderToString(<AnimatedCoursePlan {...complexProps} />);
      
      expect(serverRender1).toBe(serverRender2);
    });
  });

  describe('Client-Side Hydration Matching', () => {
    it('matches server render on initial client hydration', () => {
      // This test simulates what happens during Next.js hydration
      
      // Mock server environment for first render
      const originalWindow = global.window;
      const originalDocument = global.document;
      
      // @ts-ignore
      delete global.window;
      // @ts-ignore  
      delete global.document;
      
      const serverHTML = renderToString(<AnimatedCoursePlan {...defaultProps} />);
      
      // Restore client environment
      global.window = originalWindow;
      global.document = originalDocument;
      
      // Create a DOM with the server HTML
      const dom = new JSDOM(`<div id="root">${serverHTML}</div>`);
      global.document = dom.window.document;
      global.window = dom.window as any;
      
      // Render on client side (this should match the server HTML)
      const { container } = render(<AnimatedCoursePlan {...defaultProps} />, {
        container: dom.window.document.getElementById('root')!,
      });
      
      // The initial render should match (before any client-side effects)
      expect(container.innerHTML).toContain('Programme de la formation');
    });

    it('handles special characters without hydration mismatch', () => {
      const specialCharContent = `Test avec caractères spéciaux :

### SECTION SPÉCIALE
a) Contenu avec "guillemets" et apostrophes d'usage, 3'42
b) Caractères accentués : é, è, ê, à, ù, ç, 5'30
c) Symboles & caractères : @ # $ % ^ & * ( ) - + = [ ] { } | \\ / ? < >`;

      const propsWithSpecialChars = {
        ...defaultProps,
        plan_md: specialCharContent,
      };

      // Server render
      const serverHTML = renderToString(<AnimatedCoursePlan {...propsWithSpecialChars} />);
      
      // Client render  
      const { container } = render(<AnimatedCoursePlan {...propsWithSpecialChars} />);
      
      // Both should contain the special characters properly encoded
      expect(serverHTML).toContain('guillemets');
      expect(container.innerHTML).toContain('guillemets');
      expect(serverHTML).toContain('caractères');
      expect(container.innerHTML).toContain('caractères');
    });
  });

  describe('Content Processing Determinism', () => {
    it('processes regex patterns consistently', () => {
      const contentWithPatterns = `Module de test :

### TEST PATTERNS
a) Vidéo d'expert sur le sujet principal, 4'23
b) Documents téléchargeables inclus dans le package
c) Quiz VRAI/FAUX pour validation des acquis
d) Tutorial YouTube complémentaire, 8'45
e) Exercices pratiques avec timer 12'30`;

      const props = { ...defaultProps, plan_md: contentWithPatterns };
      
      // Multiple renders should produce the same result
      const render1 = renderToString(<AnimatedCoursePlan {...props} />);
      const render2 = renderToString(<AnimatedCoursePlan {...props} />);
      const render3 = renderToString(<AnimatedCoursePlan {...props} />);
      
      expect(render1).toBe(render2);
      expect(render2).toBe(render3);
    });

    it('handles key generation consistently', () => {
      const contentForKeyTesting = `Test de génération de clés :

### SECTION 1  
a) Premier élément avec Vidéo, 2'30
b) Deuxième avec Documents téléchargeables
c) Troisième avec Quiz VRAI/FAUX

### SECTION 2
a) YouTube tutorial, 5'45  
b) Exercices pratiques, 10'20
c) Évaluation finale avec timer 15'30`;

      const props = { ...defaultProps, plan_md: contentForKeyTesting };
      
      // Render multiple times and check consistency
      const renders = Array.from({ length: 5 }, () => 
        renderToString(<AnimatedCoursePlan {...props} />)
      );
      
      // All renders should be identical
      const firstRender = renders[0];
      renders.forEach(render => {
        expect(render).toBe(firstRender);
      });
    });
  });

  describe('Edge Cases for Hydration', () => {
    it('handles empty or minimal content without hydration issues', () => {
      const minimalProps = { ...defaultProps, plan_md: '' };
      
      const serverRender = renderToString(<AnimatedCoursePlan {...minimalProps} />);
      const { container } = render(<AnimatedCoursePlan {...minimalProps} />);
      
      // Should render title even with empty content
      expect(serverRender).toContain('Programme de la formation');
      expect(container.innerHTML).toContain('Programme de la formation');
    });

    it('handles content with only subtitle and no sections', () => {
      const onlySubtitleContent = 'Ce module est une introduction simple.';
      const props = { ...defaultProps, plan_md: onlySubtitleContent };
      
      const serverRender = renderToString(<AnimatedCoursePlan {...props} />);
      const { container } = render(<AnimatedCoursePlan {...props} />);
      
      expect(serverRender).toContain('introduction simple');
      expect(container.innerHTML).toContain('introduction simple');
    });

    it('handles malformed markdown consistently', () => {
      const malformedContent = `Contenu mal formé
### Section sans contenu
Texte orphelin
### Autre section
a) Item sans suite
### 
Texte après section vide`;
      
      const props = { ...defaultProps, plan_md: malformedContent };
      
      // Should not throw and should render consistently
      expect(() => renderToString(<AnimatedCoursePlan {...props} />)).not.toThrow();
      expect(() => render(<AnimatedCoursePlan {...props} />)).not.toThrow();
      
      const serverRender = renderToString(<AnimatedCoursePlan {...props} />);
      const clientRender = render(<AnimatedCoursePlan {...props} />);
      
      expect(serverRender).toContain('Programme de la formation');
      expect(clientRender.container.innerHTML).toContain('Programme de la formation');
    });
  });

  describe('Gradient and Styling Consistency', () => {
    it('handles gradient styles without causing hydration mismatch', () => {
      const gradientProps = {
        ...defaultProps,
        gradientFromLight: '#FF5733',
        gradientToLight: '#C70039',
        gradientFromDark: '#900C3F',
        gradientToDark: '#581845',
        onLight: '#FFFFFF',
        onDark: '#000000',
      };

      // Server and client should handle gradients consistently
      const serverRender = renderToString(<AnimatedCoursePlan {...gradientProps} />);
      const { container } = render(<AnimatedCoursePlan {...gradientProps} />);
      
      // Both should contain the base content
      expect(serverRender).toContain('Programme de la formation');
      expect(container.innerHTML).toContain('Programme de la formation');
    });
  });

  describe('Locale Consistency', () => {
    it('handles French locale consistently', () => {
      const frProps = { ...defaultProps, locale: 'fr' as const };
      
      const render1 = renderToString(<AnimatedCoursePlan {...frProps} />);
      const render2 = renderToString(<AnimatedCoursePlan {...frProps} />);
      
      expect(render1).toBe(render2);
      expect(render1).toContain('Programme de la formation');
    });

    it('handles English locale consistently', () => {
      const enProps = { ...defaultProps, locale: 'en' as const };
      
      const render1 = renderToString(<AnimatedCoursePlan {...enProps} />);
      const render2 = renderToString(<AnimatedCoursePlan {...enProps} />);
      
      expect(render1).toBe(render2);
      expect(render1).toContain('Course Curriculum');
    });
  });
});