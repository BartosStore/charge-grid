// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KpiTile } from './KpiTile';

describe('KpiTile', () => {
  it('shows label, value and unit', () => {
    render(<KpiTile label="Energie dnes" value="1 250" unit="kWh" icon={<span />} color="#5B4CF0" />);

    expect(screen.getByText('Energie dnes')).toBeInTheDocument();
    expect(screen.getByText('1 250')).toBeInTheDocument();
    expect(screen.getByText('kWh')).toBeInTheDocument();
  });

  it('renders a skeleton instead of the value while loading', () => {
    render(<KpiTile label="Výkon" value="42" icon={<span />} color="#5B4CF0" loading />);

    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });
});
