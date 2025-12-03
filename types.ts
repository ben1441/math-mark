import React from 'react';

export interface MarkdownPreviewProps {
  content: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export enum AppState {
    IDLE,
    GENERATING,
    ERROR
}

export interface GeminiRequest {
    prompt: string;
    currentText?: string;
}