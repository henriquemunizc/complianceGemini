import { Chart, registerables } from 'chart.js';

// Registrar todos os componentes do Chart.js
Chart.register(...registerables);

// Configurações globais do Chart.js
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
Chart.defaults.color = '#495057';
Chart.defaults.borderColor = '#dee2e6';

// Configurações de animação
Chart.defaults.animation = {
  duration: 750,
  easing: 'easeInOutQuart'
};

// Configurações de interação
Chart.defaults.interaction = {
  mode: 'index',
  intersect: false
};

// Configurações de responsividade
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;
