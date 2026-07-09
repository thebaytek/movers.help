import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Landing page', () => {
  it('renders without crashing', () => {
    const { container } = render(<Home />)
    expect(container).toBeInTheDocument()
  })
})
