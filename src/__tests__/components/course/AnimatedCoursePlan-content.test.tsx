import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AnimatedCoursePlan from '@/components/course/AnimatedCoursePlan';

// Mock intersection observer
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
global.IntersectionObserver = mockIntersectionObserver;

describe('AnimatedCoursePlan Content Processing', () => {
  const defaultProps = {
    plan_md: '',
    locale: 'fr' as const,
    courseId: '123',
  };

  describe('First Line Extraction', () => {
    it('extracts first line correctly from simple content', () => {
      const content = `Ce module contient 3 parties importantes.

### SECTION 1
Contenu de la section`;

      render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      expect(screen.getByText('Ce module contient 3 parties importantes.')).toBeInTheDocument();
    });

    it('extracts first line from content with HTML tags', () => {
      const content = `<p>Ce module <strong>contient</strong> 3 parties.</p>

### SECTION 1
Contenu`;

      render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      // HTML tags should be stripped
      expect(screen.getByText(/Ce module.*contient.*3 parties/)).toBeInTheDocument();
    });

    it('handles multi-line intro text', () => {
      const content = `Première ligne du module.
Deuxième ligne d'introduction.
Troisième ligne finale.

### SECTION 1
Contenu de la section`;

      render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      // Should extract first meaningful line
      expect(screen.getByText('Première ligne du module.')).toBeInTheDocument();
    });
  });

  describe('Section Parsing', () => {
    it('parses H3 sections correctly', () => {
      const content = `Introduction

### DÉCOUVRIR
a) Premier point
b) Second point

### APPRENDRE
a) Méthode 1
b) Méthode 2`;

      render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      
      expect(screen.getByText('DÉCOUVRIR')).toBeInTheDocument();
      expect(screen.getByText('APPRENDRE')).toBeInTheDocument();
      expect(screen.getByText('Premier point')).toBeInTheDocument();
      expect(screen.getByText('Méthode 1')).toBeInTheDocument();
    });

    it('handles sections with special characters', () => {
      const content = `Introduction

### DÉCOUVRIR & EXPLORER
a) Point avec caractères spéciaux : é, è, à
b) Point avec "guillemets"

### APPRENDRE (AVANCÉ)
a) Méthode 1 & 2
b) Technique "step-by-step"`;

      render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      
      expect(screen.getByText('DÉCOUVRIR & EXPLORER')).toBeInTheDocument();
      expect(screen.getByText('APPRENDRE (AVANCÉ)')).toBeInTheDocument();
      expect(screen.getByText(/caractères spéciaux/)).toBeInTheDocument();
      expect(screen.getByText(/guillemets/)).toBeInTheDocument();
    });
  });

  describe('Icon Pattern Recognition', () => {
    it('recognizes video patterns', () => {
      const content = `### TEST
a) Storytelling : Vidéo "Formation avancée", 5'30
b) Vidéo d'expert sur le management
c) Video tutorial in English`;

      const { container } = render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      
      // Should contain video-related content
      expect(screen.getByText(/Storytelling.*Vidéo/)).toBeInTheDocument();
      expect(screen.getByText(/Vidéo d'expert/)).toBeInTheDocument();
      expect(screen.getByText(/Video tutorial/)).toBeInTheDocument();
      
      // Should have video icons (SVG elements)
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('recognizes download patterns', () => {
      const content = `### RESSOURCES
a) Documents téléchargeables inclus
b) Fichiers Downloadable documents
c) PDF et supports téléchargeables`;

      const { container } = render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      
      expect(screen.getByText(/Documents téléchargeables/)).toBeInTheDocument();
      expect(screen.getByText(/Downloadable documents/)).toBeInTheDocument();
      
      // Should have download icons
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('recognizes VRAI/FAUX patterns', () => {
      const content = `### ÉVALUATION
a) Quiz VRAI/FAUX pour tester
b) Questions TRUE/FALSE en anglais
c) Exercices VRAI/FAUX interactifs`;

      const { container } = render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      
      expect(screen.getByText(/VRAI\/FAUX/)).toBeInTheDocument();
      expect(screen.getByText(/TRUE\/FALSE/)).toBeInTheDocument();
      
      // Should have check/X icons for true/false
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('recognizes YouTube patterns', () => {
      const content = `### TUTORIALS
a) Tutorial Youtube sur les bases
b) Vidéo YouTube complémentaire
c) Playlist sur YouTube`;

      const { container } = render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      
      expect(screen.getByText(/Youtube/)).toBeInTheDocument();
      expect(screen.getByText(/YouTube/)).toBeInTheDocument();
      
      // Should have YouTube icons
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('recognizes Quiz patterns', () => {
      const content = `### ÉVALUATION
a) Quiz final de validation
b) Quizzes interactifs multiples
c) Test Quiz avec timer`;

      const { container } = render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      
      expect(screen.getByText(/Quiz final/)).toBeInTheDocument();
      expect(screen.getByText(/Quizzes interactifs/)).toBeInTheDocument();
      
      // Should have quiz icons
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('recognizes time patterns', () => {
      const content = `### DURÉES
a) Introduction générale, 2'30
b) Module principal, 15'45
c) Exercices pratiques, 8'12`;

      const { container } = render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      
      expect(screen.getByText(/2'30/)).toBeInTheDocument();
      expect(screen.getByText(/15'45/)).toBeInTheDocument();
      expect(screen.getByText(/8'12/)).toBeInTheDocument();
      
      // Should have clock icons
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('Complex Content Processing', () => {
    it('processes mixed patterns correctly', () => {
      const content = `### SECTION COMPLÈTE
a) Storytelling : Vidéo "Formation", 3'23
b) Documents téléchargeables et Quiz VRAI/FAUX, 5'45
c) Tutorial YouTube complémentaire, 8'30
d) Évaluation finale avec Quizzes, 12'15`;

      const { container } = render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      
      // All patterns should be recognized
      expect(screen.getByText(/Storytelling.*Vidéo/)).toBeInTheDocument();
      expect(screen.getByText(/Documents téléchargeables/)).toBeInTheDocument();
      expect(screen.getByText(/VRAI\/FAUX/)).toBeInTheDocument();
      expect(screen.getByText(/YouTube/)).toBeInTheDocument();
      expect(screen.getByText(/Quizzes/)).toBeInTheDocument();
      
      // Multiple time patterns
      expect(screen.getByText(/3'23/)).toBeInTheDocument();
      expect(screen.getByText(/5'45/)).toBeInTheDocument();
      expect(screen.getByText(/8'30/)).toBeInTheDocument();
      expect(screen.getByText(/12'15/)).toBeInTheDocument();
      
      // Should have multiple icons
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(5);
    });

    it('handles nested quotes and special characters', () => {
      const content = `### CONTENU SPÉCIAL
a) Vidéo "Titre avec 'apostrophes' et guillemets", 4'32
b) Documents "Fichier PDF" téléchargeables & accessibles
c) Quiz VRAI/FAUX "Test d'évaluation" interactif, 6'45`;

      render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      
      // Complex quoted content should render properly
      expect(screen.getByText(/Titre avec.*apostrophes.*guillemets/)).toBeInTheDocument();
      expect(screen.getByText(/Fichier PDF.*téléchargeables/)).toBeInTheDocument();
      expect(screen.getByText(/Test d'évaluation.*interactif/)).toBeInTheDocument();
    });

    it('preserves content structure with sub-items', () => {
      const content = `### SECTION PRINCIPALE
a) Point principal avec sous-éléments
   - Sous-point 1 avec détails
   - Sous-point 2 complémentaire
b) Autre point principal, 5'30
   - Détail technique
   - Exemple pratique`;

      render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      
      expect(screen.getByText(/Point principal/)).toBeInTheDocument();
      expect(screen.getByText(/Sous-point 1/)).toBeInTheDocument();
      expect(screen.getByText(/Sous-point 2/)).toBeInTheDocument();
      expect(screen.getByText(/Autre point principal/)).toBeInTheDocument();
      expect(screen.getByText(/5'30/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles content with no sections', () => {
      const content = `Simple text without sections.
Just paragraphs of content.
No H3 headers at all.`;

      render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      
      // Should still render the main title
      expect(screen.getByText('Programme de la formation')).toBeInTheDocument();
      expect(screen.getByText(/Simple text without sections/)).toBeInTheDocument();
    });

    it('handles empty sections', () => {
      const content = `### SECTION VIDE

### AUTRE SECTION
a) Contenu réel ici

### 
Texte après section sans titre`;

      render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      
      expect(screen.getByText('SECTION VIDE')).toBeInTheDocument();
      expect(screen.getByText('AUTRE SECTION')).toBeInTheDocument();
      expect(screen.getByText(/Contenu réel/)).toBeInTheDocument();
    });

    it('handles content with only whitespace', () => {
      const content = `   

      
      `;

      render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      
      // Should render without error
      expect(screen.getByText('Programme de la formation')).toBeInTheDocument();
    });

    it('handles very long content lines', () => {
      const longLine = 'a) ' + 'Very long content '.repeat(50) + ', 30\'45';
      const content = `### LONG CONTENT
${longLine}`;

      expect(() => {
        render(<AnimatedCoursePlan {...defaultProps} plan_md={content} />);
      }).not.toThrow();
      
      expect(screen.getByText(/Very long content/)).toBeInTheDocument();
    });
  });
});