import { useState, type FormEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQuery } from '@apollo/client/react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AlertTriangle, ArrowDownUp, Bike, BookOpen, BriefcaseBusiness, Building2, CarFront, ChartNoAxesCombined, ChevronRight, CircleArrowDown, CircleArrowUp, CirclePlus, CreditCard, Gift, HeartPulse, House, LogOut, Mail, PawPrint, Pencil, PiggyBank, Receipt, Search, ShoppingBag, ShoppingBasket, ShoppingCart, Tags, Ticket, Trash2, Utensils, UserRound, WalletCards, X } from 'lucide-react'
import {
  CREATE_CATEGORY, CREATE_TRANSACTION, DELETE_CATEGORY, DELETE_TRANSACTION,
  UPDATE_CATEGORY, UPDATE_TRANSACTION,
} from '@/lib/graphql/mutations'
import { LIST_CATEGORIES, LIST_TRANSACTIONS } from '@/lib/graphql/queries'
import { useAuthStore } from '@/stores/auth'
import type { Category, Transaction, TransactionType } from '@/types'

type TransactionsResult = { listTransactions: Transaction[] }
type CategoriesResult = { listCategories: Category[] }

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })

function money(value: number) { return currency.format(value) }
function monthTransactions(transactions: Transaction[]) {
  const now = new Date()
  return transactions.filter((item) => {
    const date = new Date(item.date)
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  })
}
function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.replace(/^.*?: /, '') : 'Não foi possível concluir. Tente novamente.'
}

function PageHeading({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail: string; action?: ReactNode }) {
  return <div className="page-heading"><div><div className="page-eyebrow">{eyebrow}</div><h1>{title}</h1><p>{detail}</p></div>{action}</div>
}

function LoadingState() { return <div className="loading-state"><span className="loading-dot" /> Carregando seus dados...</div> }
function ErrorState({ message }: { message: string }) { return <div className="error-state" role="alert">{message}</div> }

export function DashboardPage() {
  const { data, loading, error } = useQuery<TransactionsResult>(LIST_TRANSACTIONS)
  const { data: categoryData, loading: categoriesLoading, error: categoriesError } = useQuery<CategoriesResult>(LIST_CATEGORIES)
  const transactions = data?.listTransactions ?? []
  const categories = categoryData?.listCategories ?? []
  const currentMonth = monthTransactions(transactions)
  const income = currentMonth.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)
  const expenses = currentMonth.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
  const balance = transactions.reduce((sum, item) => sum + (item.type === 'income' ? item.amount : -item.amount), 0)
  const recent = [...transactions].sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime()).slice(0, 5)
  const categorySummaries = categories.map((category, index) => {
    const related = transactions.filter((transaction) => transaction.categoryId === category.id)
    return {
      ...category,
      count: related.length,
      total: related.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.amount, 0),
      color: category.color || dashboardPalette[index % dashboardPalette.length],
    }
  }).slice(0, 5)

  return (
    <div className="dashboard-home">
      {loading || categoriesLoading ? <LoadingState /> : error || categoriesError ? <ErrorState message={(error || categoriesError)?.message ?? 'Não foi possível carregar o dashboard.'} /> : <>
        <div className="dashboard-metrics">
          <section className="metric-card"><span className="metric-icon balance"><WalletCards size={17} /></span><span className="metric-label">SALDO TOTAL</span><strong>{money(balance)}</strong></section>
          <section className="metric-card"><span className="metric-icon income"><CircleArrowUp size={17} /></span><span className="metric-label">RECEITAS DO MÊS</span><strong>{money(income)}</strong></section>
          <section className="metric-card"><span className="metric-icon expense"><CircleArrowDown size={17} /></span><span className="metric-label">DESPESAS DO MÊS</span><strong>{money(expenses)}</strong></section>
        </div>
        <div className="dashboard-columns">
          <section className="dashboard-panel dashboard-transactions">
            <header className="dashboard-panel-header"><h1>TRANSAÇÕES RECENTES</h1><Link to="/transactions">Ver todas <ChevronRight size={16} /></Link></header>
            {recent.length ? <div className="dashboard-transaction-list">{recent.map((transaction) => {
              const categoryIndex = categories.findIndex((category) => category.id === transaction.categoryId)
              const color = transaction.category?.color || dashboardPalette[Math.max(categoryIndex, 0) % dashboardPalette.length]
              return <article className="dashboard-transaction" key={transaction.id}>
                <span className={`dashboard-transaction-icon ${transaction.type}`} style={{ '--transaction-color': color } as React.CSSProperties}><CategoryGlyph icon={transaction.category?.icon ?? null} name={transaction.category?.name} /></span>
                <div className="dashboard-transaction-main"><strong>{transaction.description}</strong><span>{shortDateFormatter.format(new Date(transaction.date))}</span></div>
                <span className={`dashboard-category-chip ${transaction.type}`} style={{ '--transaction-color': color } as React.CSSProperties}>{transaction.type === 'income' ? 'Receita' : transaction.category?.name ?? 'Sem categoria'}</span>
                <strong className={`dashboard-transaction-amount ${transaction.type}`}>{transaction.type === 'income' ? '+' : '-'} {money(transaction.amount)}</strong>
                {transaction.type === 'income' ? <CircleArrowUp className="amount-direction income" size={15} /> : <CircleArrowDown className="amount-direction expense" size={15} />}
              </article>
            })}</div> : <div className="dashboard-empty">Nenhuma transação recente.</div>}
            <Link className="dashboard-add-transaction" to="/transactions?new=1"><CirclePlus size={17} /> Nova transação</Link>
          </section>
          <section className="dashboard-panel dashboard-category-panel">
            <header className="dashboard-panel-header"><h2>CATEGORIAS</h2><Link to="/categories">Gerenciar <ChevronRight size={16} /></Link></header>
            {categorySummaries.length ? <div className="dashboard-category-list">{categorySummaries.map((category) => <div className="dashboard-category-row" key={category.id}>
              <span className="dashboard-category-name" style={{ '--transaction-color': category.color } as React.CSSProperties}>{category.name}</span>
              <span className="dashboard-category-count">{category.count} {category.count === 1 ? 'item' : 'itens'}</span>
              <strong>{money(category.total)}</strong>
            </div>)}</div> : <div className="dashboard-empty">Nenhuma categoria cadastrada.</div>}
          </section>
        </div>
      </>}
    </div>
  )
}

const dashboardPalette = ['#3B82F6', '#8B5CF6', '#F97316', '#EC4899', '#EAB308']

function EmptyState({ icon, title, detail, action }: { icon: ReactNode; title: string; detail: string; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-icon">{icon}</span><h3>{title}</h3><p>{detail}</p>{action}</div>
}

function CategoryGlyph({ icon, name = '' }: { icon: string | null; name?: string }) {
  const props = { size: 18, strokeWidth: 1.9 }
  const value = `${icon ?? ''} ${name}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (/briefcase|salario|renda|trabalho/.test(value)) return <BriefcaseBusiness {...props} />
  if (/health|saude|medic/.test(value)) return <HeartPulse {...props} />
  if (/piggy|investimento|poupanca/.test(value)) return <PiggyBank {...props} />
  if (/ticket|entretenimento|lazer/.test(value)) return <Ticket {...props} />
  if (/gift|presente/.test(value)) return <Gift {...props} />
  if (/paw|pet|animal/.test(value)) return <PawPrint {...props} />
  if (/bike|bicicleta/.test(value)) return <Bike {...props} />
  if (/book|educacao|livro/.test(value)) return <BookOpen {...props} />
  if (/building|utilidades|conta/.test(value)) return <Building2 {...props} />
  if (/credit|cartao|fatura/.test(value)) return <CreditCard {...props} />
  if (/receipt|recibo/.test(value)) return <Receipt {...props} />
  if (/shoppingcart|mercado|supermercado/.test(value)) return <ShoppingCart {...props} />
  if (/shoppingbag|sacola/.test(value)) return <ShoppingBag {...props} />
  if (/food|aliment|comida|refeicao|restaurante/.test(value)) return <Utensils {...props} />
  if (/home|moradia|casa/.test(value)) return <House {...props} />
  if (/transport|transporte|combustivel/.test(value)) return <CarFront {...props} />
  if (/investment/.test(value)) return <ChartNoAxesCombined {...props} />
  if (/shopping|compras|mercado/.test(value)) return <ShoppingBasket {...props} />
  return <Tags {...props} />
}

export function TransactionsPage() {
  const { data, loading, error } = useQuery<TransactionsResult>(LIST_TRANSACTIONS)
  const { data: categoryData } = useQuery<CategoriesResult>(LIST_CATEGORIES)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [dialogOpen, setDialogOpen] = useState(searchParams.get('new') === '1')
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteTransaction] = useMutation(DELETE_TRANSACTION, { refetchQueries: [LIST_TRANSACTIONS], awaitRefetchQueries: true })
  const transactions = data?.listTransactions ?? []
  const categories = categoryData?.listCategories ?? []
  const pageSize = 10
  const monthOptions = [...new Set(transactions.map((item) => item.date.slice(0, 7)))].sort((first, second) => second.localeCompare(first))
  const filtered = transactions.filter((item) => {
    const matchesType = selectedType === 'all' || item.type === selectedType
    const matchesSearch = item.description.toLowerCase().includes(search.trim().toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory
    const matchesMonth = selectedMonth === 'all' || item.date.slice(0, 7) === selectedMonth
    return matchesType && matchesSearch && matchesCategory && matchesMonth
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, pageCount)
  const pageTransactions = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
  const firstResult = filtered.length ? (safePage - 1) * pageSize + 1 : 0
  const lastResult = Math.min(safePage * pageSize, filtered.length)

  function openCreate() { setEditing(null); setDialogOpen(true); setSearchParams({ new: '1' }) }
  function closeDialog() { setDialogOpen(false); setEditing(null); setSearchParams({}) }
  function resetPage() { setCurrentPage(1) }
  async function confirmRemoveTransaction() {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      await deleteTransaction({ variables: { id: pendingDelete.id } })
      toast.success('Transação excluída', { description: `“${pendingDelete.description}” foi removida.` })
      setPendingDelete(null)
    } catch (removeError) {
      toast.error('Não foi possível excluir a transação', { description: errorMessage(removeError) })
    } finally {
      setIsDeleting(false)
    }
  }

  return <>
    <PageHeading eyebrow="" title="Transações" detail="Gerencie todas as suas transações financeiras" action={<button className="button button-primary" onClick={openCreate}><CirclePlus size={16} /> Nova transação</button>} />
    <section className="transaction-filters">
      <label>Buscar<span className="transaction-search"><Search size={15} /><input aria-label="Buscar por descrição" value={search} onChange={(event) => { setSearch(event.target.value); resetPage() }} placeholder="Buscar por descrição" /></span></label>
      <label>Tipo<select value={selectedType} onChange={(event) => { setSelectedType(event.target.value); resetPage() }}><option value="all">Todos</option><option value="expense">Saída</option><option value="income">Entrada</option></select></label>
      <label>Categoria<select value={selectedCategory} onChange={(event) => { setSelectedCategory(event.target.value); resetPage() }}><option value="all">Todas</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label>Período<select value={selectedMonth} onChange={(event) => { setSelectedMonth(event.target.value); resetPage() }}><option value="all">Todos os períodos</option>{monthOptions.map((month) => <option key={month} value={month}>{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T12:00:00`))}</option>)}</select></label>
    </section>
    <section className="transaction-table-panel">
      {loading ? <LoadingState /> : error ? <ErrorState message={error.message} /> : <>
        <div className="transaction-table-scroll"><table className="transaction-table"><thead><tr><th>Descrição</th><th>Data</th><th>Categoria</th><th>Tipo</th><th>Valor</th><th>Ações</th></tr></thead><tbody>
          {pageTransactions.map((item) => {
            const categoryColor = item.category?.color || '#2563eb'
            return <tr key={item.id}>
              <td><span className="table-description"><span className={`table-transaction-icon ${item.type}`} style={{ '--transaction-color': categoryColor } as React.CSSProperties}><CategoryGlyph icon={item.category?.icon ?? null} name={item.category?.name} /></span><strong>{item.description}</strong></span></td>
              <td className="table-date">{shortDateFormatter.format(new Date(item.date))}</td>
              <td><span className="table-category-chip" style={{ '--transaction-color': categoryColor } as React.CSSProperties}>{item.category?.name ?? 'Sem categoria'}</span></td>
              <td><span className={`table-type ${item.type}`}>{item.type === 'income' ? <CircleArrowUp size={13} /> : <CircleArrowDown size={13} />}{item.type === 'income' ? 'Entrada' : 'Saída'}</span></td>
              <td className="table-amount">{item.type === 'income' ? '+' : '-'} {money(item.amount)}</td>
              <td><div className="table-actions"><button aria-label={`Excluir ${item.description}`} title="Excluir transação" onClick={() => setPendingDelete(item)}><Trash2 size={14} /></button><button aria-label={`Editar ${item.description}`} title="Editar transação" onClick={() => { setEditing(item); setDialogOpen(true) }}><Pencil size={14} /></button></div></td>
            </tr>
          })}
          {!pageTransactions.length && <tr><td colSpan={6} className="transaction-table-empty">{transactions.length ? 'Nenhuma transação corresponde aos filtros.' : 'Nenhuma transação cadastrada.'}</td></tr>}
        </tbody></table></div>
        <footer className="transaction-pagination"><span>{firstResult} a {lastResult} | {filtered.length} resultados</span><div><button aria-label="Página anterior" disabled={safePage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}><ChevronRight className="previous-chevron" size={15} /></button>{Array.from({ length: Math.min(pageCount, 3) }, (_, index) => index + 1).map((page) => <button key={page} className={safePage === page ? 'current' : ''} onClick={() => setCurrentPage(page)}>{page}</button>)}{pageCount > 3 && <span className="pagination-ellipsis">...</span>}{pageCount > 3 && <button onClick={() => setCurrentPage(pageCount)}>{pageCount}</button>}<button aria-label="Próxima página" disabled={safePage >= pageCount} onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}><ChevronRight size={15} /></button></div></footer>
      </>}
    </section>
    {dialogOpen && <TransactionDialog categories={categories} transaction={editing} onClose={closeDialog} />}
    {pendingDelete && <DeleteConfirmationDialog title="Excluir transação?" itemName={pendingDelete.description} isDeleting={isDeleting} onCancel={() => setPendingDelete(null)} onConfirm={() => void confirmRemoveTransaction()} />}
  </>
}

export function CategoriesPage() {
  const { data, loading, error } = useQuery<CategoriesResult>(LIST_CATEGORIES)
  const { data: transactionData } = useQuery<TransactionsResult>(LIST_TRANSACTIONS)
  const [editing, setEditing] = useState<Category | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteCategory] = useMutation(DELETE_CATEGORY, { refetchQueries: [LIST_CATEGORIES], awaitRefetchQueries: true })
  const categories = data?.listCategories ?? []
  const transactions = transactionData?.listTransactions ?? []
  const categoryUsage = categories.map((category) => ({
    category,
    count: transactions.filter((transaction) => transaction.categoryId === category.id).length,
  }))
  const featuredCategory = [...categoryUsage].sort((first, second) => second.count - first.count)[0]

  async function confirmRemoveCategory() {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      await deleteCategory({ variables: { id: pendingDelete.id } })
      toast.success('Categoria excluída', { description: `“${pendingDelete.name}” foi removida.` })
      setPendingDelete(null)
    } catch (removeError) {
      toast.error('Não foi possível excluir a categoria', { description: errorMessage(removeError) })
    } finally {
      setIsDeleting(false)
    }
  }

  return <>
    <PageHeading eyebrow="" title="Categorias" detail="Organize suas transações por categorias" action={<button className="button button-primary" onClick={() => { setEditing(null); setDialogOpen(true) }}><CirclePlus size={16} /> Nova categoria</button>} />
    {loading ? <LoadingState /> : error ? <ErrorState message={error.message} /> : <>
      <div className="category-summary-grid">
        <section className="category-stat-card"><span className="category-stat-icon"><Tags size={18} /></span><div className="category-stat-copy"><strong>{categories.length}</strong><span>Total de categorias</span></div></section>
        <section className="category-stat-card"><span className="category-stat-icon purple"><ArrowDownUp size={18} /></span><div className="category-stat-copy"><strong>{transactions.length}</strong><span>Total de transações</span></div></section>
        <section className="category-stat-card featured-stat"><span className="category-stat-icon amber"><CategoryGlyph icon={featuredCategory?.category.icon ?? null} name={featuredCategory?.category.name} /></span><div className="category-stat-copy"><strong>{featuredCategory?.category.name ?? 'Sem categorias'}</strong><span>Categoria mais utilizada</span></div></section>
      </div>
      {categories.length ? <div className="category-grid">{categoryUsage.map(({ category, count }, index) => {
        const color = category.color || palette[index % palette.length]
        return <article className="category-card" key={category.id}>
          <div className="category-card-top"><span className="category-icon" style={{ backgroundColor: `${color}18`, color }}><CategoryGlyph icon={category.icon} name={category.name} /></span><div className="category-actions"><button title="Excluir categoria" aria-label={`Excluir categoria ${category.name}`} onClick={() => setPendingDelete(category)}><Trash2 size={15} /></button><button title="Editar categoria" aria-label={`Editar ${category.name}`} onClick={() => { setEditing(category); setDialogOpen(true) }}><Pencil size={15} /></button></div></div>
          <h2>{category.name}</h2><p>{category.description || 'Organize suas transações'}</p>
          <div className="category-card-footer"><span style={{ color, backgroundColor: `${color}18` }}>{category.name}</span><small>{count} {count === 1 ? 'item' : 'itens'}</small></div>
        </article>
      })}</div> : <section className="panel"><EmptyState icon={<Tags size={22} />} title="Crie sua primeira categoria" detail="Organize suas transações por categorias e acompanhe seus hábitos." action={<button className="button button-secondary" onClick={() => setDialogOpen(true)}>Criar categoria</button>} /></section>}
    </>}
    {dialogOpen && <CategoryDialog category={editing} onClose={() => { setDialogOpen(false); setEditing(null) }} />}
    {pendingDelete && <DeleteConfirmationDialog title="Excluir categoria?" itemName={pendingDelete.name} isDeleting={isDeleting} onCancel={() => setPendingDelete(null)} onConfirm={() => void confirmRemoveCategory()} />}
  </>
}

const palette = ['#2563EB', '#16A34A', '#DC2626', '#CA8A04', '#DB2777', '#7E22CE']
const categoryIconOptions = [
  { value: 'briefcase', label: 'Trabalho', Icon: BriefcaseBusiness },
  { value: 'transport', label: 'Transporte', Icon: CarFront },
  { value: 'health', label: 'Saúde', Icon: HeartPulse },
  { value: 'piggy', label: 'Investimentos', Icon: PiggyBank },
  { value: 'shoppingcart', label: 'Mercado', Icon: ShoppingCart },
  { value: 'ticket', label: 'Entretenimento', Icon: Ticket },
  { value: 'gift', label: 'Presentes', Icon: Gift },
  { value: 'food', label: 'Alimentação', Icon: Utensils },
  { value: 'paw', label: 'Animais', Icon: PawPrint },
  { value: 'home', label: 'Moradia', Icon: House },
  { value: 'shoppingbag', label: 'Compras', Icon: ShoppingBag },
  { value: 'bike', label: 'Bicicleta', Icon: Bike },
  { value: 'book', label: 'Educação', Icon: BookOpen },
  { value: 'building', label: 'Contas', Icon: Building2 },
  { value: 'credit', label: 'Cartão', Icon: CreditCard },
  { value: 'receipt', label: 'Recibos', Icon: Receipt },
]
const categoryColorOptions = [
  { name: 'Verde', value: '#16803d' },
  { name: 'Azul', value: '#2563eb' },
  { name: 'Roxo', value: '#9333ea' },
  { name: 'Rosa', value: '#db2777' },
  { name: 'Vermelho', value: '#dc2626' },
  { name: 'Laranja', value: '#ea580c' },
  { name: 'Amarelo', value: '#ca8a04' },
]

export function AccountPage() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [name, setName] = useState(user?.name ?? '')
  const [feedback, setFeedback] = useState('')
  const initials = user?.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() ?? 'U'

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback('A API ainda não permite salvar alterações no perfil.')
  }

  return <section className="account-page">
    <article className="account-card">
      <header className="account-card-profile"><span className="account-avatar">{initials}</span><h1>{user?.name ?? 'Conta'}</h1><p>{user?.email ?? ''}</p></header>
      <form className="account-form" onSubmit={saveProfile}>
        <label>Nome completo<span className="account-input-wrap"><UserRound size={15} /><input value={name} onChange={(event) => { setName(event.target.value); setFeedback('') }} required minLength={3} /></span></label>
        <label>E-mail<span className="account-input-wrap readonly"><Mail size={15} /><input value={user?.email ?? ''} readOnly /></span><small>O e-mail não pode ser alterado</small></label>
        {feedback && <p className="account-feedback" role="status">{feedback}</p>}
        <button className="button button-primary account-save" type="submit">Salvar alterações</button>
      </form>
      <button className="button account-logout" onClick={logout}><LogOut size={15} /> Sair da conta</button>
    </article>
  </section>
}

function DeleteConfirmationDialog({ title, itemName, isDeleting, onCancel, onConfirm }: { title: string; itemName: string; isDeleting: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <Modal className="delete-confirmation-dialog" title={title} subtitle="Esta ação não pode ser desfeita." onClose={onCancel}>
    <div className="delete-confirmation-content">
      <span className="delete-confirmation-icon"><AlertTriangle size={20} /></span>
      <p>Tem certeza de que deseja excluir <strong>“{itemName}”</strong>?</p>
    </div>
    <div className="delete-confirmation-actions">
      <button className="button button-secondary" type="button" onClick={onCancel} disabled={isDeleting}>Cancelar</button>
      <button className="button button-destructive" type="button" onClick={onConfirm} disabled={isDeleting}>{isDeleting ? 'Excluindo...' : 'Excluir'}</button>
    </div>
  </Modal>
}

function Modal({ title, subtitle, children, onClose, className = '' }: { title: string; subtitle: string; children: ReactNode; onClose: () => void; className?: string }) {
  return createPortal(<div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className={`form-dialog ${className}`} role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div className="dialog-heading"><div><h2 id="dialog-title">{title}</h2><p>{subtitle}</p></div><button className="icon-button" aria-label="Fechar" onClick={onClose}><X size={19} /></button></div>{children}</section></div>, document.body)
}

function TransactionDialog({ categories, transaction, onClose }: { categories: Category[]; transaction: Transaction | null; onClose: () => void }) {
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense')
  const [createTransaction] = useMutation(CREATE_TRANSACTION, { refetchQueries: [LIST_TRANSACTIONS], awaitRefetchQueries: true })
  const [updateTransaction] = useMutation(UPDATE_TRANSACTION, { refetchQueries: [LIST_TRANSACTIONS], awaitRefetchQueries: true })

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSaving(true)
    const values = new FormData(event.currentTarget)
    const date = String(values.get('date'))
    const data = { description: String(values.get('description')).trim(), amount: Number(values.get('amount')), type, categoryId: String(values.get('categoryId')), date: new Date(`${date}T12:00:00`).toISOString() }
    try {
      if (transaction) await updateTransaction({ variables: { id: transaction.id, data } })
      else await createTransaction({ variables: { data } })
      toast.success(transaction ? 'Transação atualizada' : 'Transação cadastrada', { description: `“${data.description}” foi salva.` })
      onClose()
    } catch (submitError) {
      const message = errorMessage(submitError)
      setError(message)
      toast.error(transaction ? 'Não foi possível atualizar a transação' : 'Não foi possível cadastrar a transação', { description: message })
    } finally { setSaving(false) }
  }

  return <Modal className="transaction-dialog" title={transaction ? 'Editar transação' : 'Nova transação'} subtitle={transaction ? 'Atualize os dados da sua transação' : 'Registre sua despesa ou receita'} onClose={onClose}>
    {!categories.length && <p className="form-error">Crie uma categoria antes de registrar uma transação. <Link to="/categories">Ir para categorias</Link></p>}
    <form className="dialog-form transaction-form" onSubmit={submit}>
      <div className="transaction-type-toggle" aria-label="Tipo da transação"><button type="button" className={type === 'expense' ? 'selected expense' : ''} aria-pressed={type === 'expense'} onClick={() => setType('expense')}><CircleArrowDown size={14} /> Despesa</button><button type="button" className={type === 'income' ? 'selected income' : ''} aria-pressed={type === 'income'} onClick={() => setType('income')}><CircleArrowUp size={14} /> Receita</button></div>
      <label>Descrição<input name="description" placeholder="Ex. Almoço no restaurante" defaultValue={transaction?.description} required maxLength={100} /></label>
      <div className="form-two-col transaction-date-amount"><label>Data<input name="date" type="date" defaultValue={transaction ? new Date(transaction.date).toISOString().slice(0, 10) : ''} required /></label><label>Valor<input name="amount" type="number" min="0.01" step="0.01" placeholder="R$ 0,00" defaultValue={transaction?.amount} required /></label></div>
      <label>Categoria<select name="categoryId" defaultValue={transaction?.categoryId ?? ''} required disabled={!categories.length}><option value="" disabled>Selecione</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary transaction-save" type="submit" disabled={saving || !categories.length}>{saving ? 'Salvando...' : 'Salvar'}</button>
    </form>
  </Modal>
}

function CategoryDialog({ category, onClose }: { category: Category | null; onClose: () => void }) {
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState(category?.icon || 'briefcase')
  const [selectedColor, setSelectedColor] = useState(category?.color || categoryColorOptions[0].value)
  const [createCategory] = useMutation(CREATE_CATEGORY, { refetchQueries: [LIST_CATEGORIES], awaitRefetchQueries: true })
  const [updateCategory] = useMutation(UPDATE_CATEGORY, { refetchQueries: [LIST_CATEGORIES], awaitRefetchQueries: true })

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSaving(true)
    const values = new FormData(event.currentTarget)
    const data = { name: String(values.get('name')).trim(), description: String(values.get('description')).trim(), color: selectedColor, icon: selectedIcon }
    try {
      if (category) await updateCategory({ variables: { id: category.id, data } })
      else await createCategory({ variables: { data } })
      toast.success(category ? 'Categoria atualizada' : 'Categoria cadastrada', { description: `“${data.name}” foi salva.` })
      onClose()
    } catch (submitError) {
      const message = errorMessage(submitError)
      setError(message)
      toast.error(category ? 'Não foi possível atualizar a categoria' : 'Não foi possível cadastrar a categoria', { description: message })
    } finally { setSaving(false) }
  }

  return <Modal className="category-dialog" title={category ? 'Editar categoria' : 'Nova categoria'} subtitle="Organize suas transações com categorias" onClose={onClose}>
    <form className="dialog-form category-form" onSubmit={submit}>
      <label>Título<input name="name" placeholder="Ex. Alimentação" defaultValue={category?.name} required maxLength={40} /></label>
      <label>Descrição <span className="optional-label">Opcional</span><input name="description" placeholder="Descrição da categoria" defaultValue={category?.description ?? ''} maxLength={100} /></label>
      <fieldset className="category-choice-field"><legend>Ícone</legend><div className="category-icon-picker">{categoryIconOptions.map(({ value, label, Icon }) => <button className={selectedIcon === value ? 'selected' : ''} key={value} type="button" aria-label={label} aria-pressed={selectedIcon === value} onClick={() => setSelectedIcon(value)}><Icon size={17} strokeWidth={1.8} /></button>)}</div></fieldset>
      <fieldset className="category-choice-field"><legend>Cor</legend><div className="category-color-picker">{categoryColorOptions.map(({ name, value }) => <button className={selectedColor.toLowerCase() === value.toLowerCase() ? 'selected' : ''} key={value} type="button" aria-label={`Cor ${name}`} aria-pressed={selectedColor.toLowerCase() === value.toLowerCase()} onClick={() => setSelectedColor(value)}><span style={{ backgroundColor: value }} /></button>)}</div></fieldset>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary category-save" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
    </form>
  </Modal>
}