import Link from 'next/link'

const Nav = () => {
  return (
    <div className="flex space-x-4">
      <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
        Resumen
      </Link>
      <Link href="/gastos" className="text-sm font-medium transition-colors hover:text-primary">
        Gastos
      </Link>
      <Link href="/ingresos" className="text-sm font-medium transition-colors hover:text-primary">
        Ingresos
      </Link>
      <Link href="/tarjetas" className="text-sm font-medium transition-colors hover:text-primary">
        Tarjetas
      </Link>
      <Link href="/cuotas" className="text-sm font-medium transition-colors hover:text-primary">
        Cuotas
      </Link>
      <Link href="/deudas" className="text-sm font-medium transition-colors hover:text-primary">
        Deudas
      </Link>
    </div>
  )
}

export default Nav 