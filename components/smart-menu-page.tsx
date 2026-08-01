'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  ChevronDown,
  Clock3,
  Flame,
  Hand,
  Home,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import type { Locale } from '@/i18n/config'
import {
  getMenuProduct,
  getMenuProductDetails,
  menuCatalog,
  menuCategories,
  type MenuCategoryId,
} from '@/lib/menu-catalog'
import { VoiceConcierge } from '@/components/voice-concierge'

type SmartMenuPageProps = {
  locale: Locale
}

type Cart = Record<string, number>

type AgentActivity = {
  productId: string
  phase: 'finding' | 'reviewing' | 'adding'
}

type AgentPointer = {
  x: number
  y: number
  pressed: boolean
}

const copy = {
  ar: {
    subtitle: 'المنيو الذكي',
    search: 'بتدور على إيه؟',
    cart: 'السلة',
    add: 'أضف',
    popular: 'الأكثر طلبًا',
    results: 'صنف متاح',
    emptyResults: 'مفيش أصناف مطابقة',
    emptyResultsHint: 'جرّب كلمة تانية أو اختار تصنيف مختلف.',
    cartEmpty: 'سلتك مستنياك',
    cartEmptyHint: 'ضيف صنف من المنيو أو اطلبه من Minu بالصوت.',
    total: 'الإجمالي',
    checkout: 'كمّل الطلب',
    orderTitle: 'بيانات الطلب',
    name: 'الاسم',
    namePlaceholder: 'اكتب اسمك',
    orderType: 'طريقة الاستلام',
    table: 'على الترابيزة',
    pickup: 'استلام من الكاونتر',
    tableNumber: 'رقم الترابيزة',
    placeOrder: 'أكد الطلب',
    successTitle: 'طلبك وصل للمطبخ',
    successText: 'ده ديمو، لكن رحلة الطلب كاملة وجاهزة للتجربة.',
    newOrder: 'ابدأ طلب جديد',
    close: 'إغلاق السلة',
    remove: 'حذف',
    backHome: 'الصفحة الرئيسية',
    aiHint: 'أو قول لـMinu: عايز برجرين ولاتيه مثلج',
    details: 'تفاصيل المنتج',
    ingredients: 'المكونات',
    calories: 'سعر حراري',
    minutes: 'دقيقة تجهيز',
    addToCart: 'أضف للسلة',
    quantity: 'الكمية',
    agentFinding: 'Minu بتدور على',
    agentReviewing: 'لقيته — دي تفاصيله',
    agentAdding: 'بيتضاف للسلة دلوقتي',
  },
  en: {
    subtitle: 'Smart menu',
    search: 'What are you craving?',
    cart: 'Cart',
    add: 'Add',
    popular: 'Popular',
    results: 'items available',
    emptyResults: 'No matching items',
    emptyResultsHint: 'Try another search or choose a different category.',
    cartEmpty: 'Your cart is ready',
    cartEmptyHint: 'Add from the menu or ask Minu by voice.',
    total: 'Total',
    checkout: 'Continue order',
    orderTitle: 'Order details',
    name: 'Name',
    namePlaceholder: 'Enter your name',
    orderType: 'Collection method',
    table: 'At my table',
    pickup: 'Counter pickup',
    tableNumber: 'Table number',
    placeOrder: 'Place order',
    successTitle: 'Your order reached the kitchen',
    successText: 'This is a demo, but the complete ordering flow is ready to try.',
    newOrder: 'Start a new order',
    close: 'Close cart',
    remove: 'Remove',
    backHome: 'Home page',
    aiHint: 'Or tell Minu: two burgers and an iced latte',
    details: 'Product details',
    ingredients: 'Ingredients',
    calories: 'calories',
    minutes: 'min prep',
    addToCart: 'Add to cart',
    quantity: 'Quantity',
    agentFinding: 'Minu is finding',
    agentReviewing: 'Found it — here are the details',
    agentAdding: 'Adding it to your cart',
  },
} as const

export function SmartMenuPage({ locale }: SmartMenuPageProps) {
  const t = copy[locale]
  const isArabic = locale === 'ar'
  const [category, setCategory] = useState<MenuCategoryId>('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<Cart>({})
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [orderType, setOrderType] = useState<'table' | 'pickup'>('table')
  const [tableNumber, setTableNumber] = useState('')
  const [orderComplete, setOrderComplete] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [detailQuantity, setDetailQuantity] = useState(1)
  const [detailOpenedByAgent, setDetailOpenedByAgent] = useState(false)
  const [agentActivity, setAgentActivity] = useState<AgentActivity | null>(null)
  const [agentPointer, setAgentPointer] = useState<AgentPointer | null>(null)
  const [agentCartOpening, setAgentCartOpening] = useState(false)
  const [cartArriving, setCartArriving] = useState(false)
  const agentTimersRef = useRef<number[]>([])
  const queuedAgentDelayRef = useRef(0)

  useEffect(() => {
    return () => {
      agentTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase(locale)

    return menuCatalog.filter((product) => {
      const matchesCategory = category === 'all' || product.category === category
      const searchable = [
        product.nameAr,
        product.nameEn,
        product.descriptionAr,
        product.descriptionEn,
      ]
        .join(' ')
        .toLocaleLowerCase(locale)

      return matchesCategory && (!normalized || searchable.includes(normalized))
    })
  }, [category, locale, search])

  const selectedProduct = selectedProductId
    ? getMenuProduct(selectedProductId)
    : undefined
  const selectedProductDetails = selectedProductId
    ? getMenuProductDetails(selectedProductId)
    : undefined
  const activityProduct = agentActivity
    ? getMenuProduct(agentActivity.productId)
    : undefined

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, quantity]) => {
          const product = getMenuProduct(id)
          return product ? { product, quantity } : null
        })
        .filter(Boolean) as Array<{
        product: NonNullable<ReturnType<typeof getMenuProduct>>
        quantity: number
      }>,
    [cart],
  )

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )

  const formatPrice = (price: number) =>
    isArabic ? `${price} ج.م` : `EGP ${price}`

  const addMenuItem = useCallback(
    (itemId: string, quantity = 1) => {
      const product = getMenuProduct(itemId)

      if (!product) {
        return 'The requested item is not available.'
      }

      const safeQuantity = Math.max(1, Math.min(12, quantity))
      setCart((current) => ({
        ...current,
        [itemId]: Math.min(12, (current[itemId] || 0) + safeQuantity),
      }))
      setToast(
        isArabic
          ? `تمت إضافة ${product.nameAr} للسلة`
          : `${product.nameEn} was added to your cart`,
      )
      window.setTimeout(() => setToast(null), 2400)

      return `Done. Added ${safeQuantity} x ${product.nameEn} to the cart.`
    },
    [isArabic],
  )

  function openProductDetails(itemId: string, openedByAgent = false) {
    setSelectedProductId(itemId)
    setDetailQuantity(1)
    setDetailOpenedByAgent(openedByAgent)
  }

  function closeProductDetails() {
    setSelectedProductId(null)
    setDetailQuantity(1)
    setDetailOpenedByAgent(false)
  }

  const showAgentPointerAtDock = useCallback(() => {
    setAgentPointer({
      x: Math.max(14, window.innerWidth / 2 - 22),
      y: Math.max(14, window.innerHeight - 118),
      pressed: false,
    })
  }, [])

  const moveAgentPointerTo = useCallback(
    (elementId: string, pressed = false) => {
      const element = document.getElementById(elementId)

      if (!element) {
        return false
      }

      const rect = element.getBoundingClientRect()
      setAgentPointer((current) => ({
        x: Math.max(10, Math.min(window.innerWidth - 54, rect.left + rect.width / 2 - 22)),
        y: Math.max(10, Math.min(window.innerHeight - 64, rect.top + rect.height / 2 - 22)),
        pressed: current ? pressed : false,
      }))
      return true
    },
    [],
  )

  const showMenuItemWithAgent = useCallback(
    (itemId: string) => {
      const product = getMenuProduct(itemId)

      if (!product) {
        return 'The requested item is not available.'
      }

      const duration = 1650
      const baseDelay = queuedAgentDelayRef.current
      queuedAgentDelayRef.current += duration
      const schedule = (delay: number, callback: () => void) => {
        const timer = window.setTimeout(callback, baseDelay + delay)
        agentTimersRef.current.push(timer)
      }

      schedule(0, () => {
        setCategory('all')
        setSearch('')
        closeProductDetails()
        setAgentActivity({ productId: itemId, phase: 'finding' })
        showAgentPointerAtDock()
      })
      schedule(50, () => {
        document.getElementById(`menu-product-${itemId}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      })
      schedule(420, () => {
        moveAgentPointerTo(`menu-product-${itemId}`)
      })
      schedule(820, () => {
        moveAgentPointerTo(`menu-product-${itemId}`, true)
        setAgentActivity({ productId: itemId, phase: 'reviewing' })
        openProductDetails(itemId, true)
      })
      schedule(1030, () => {
        setAgentPointer((current) =>
          current ? { ...current, pressed: false } : current,
        )
      })
      schedule(1480, () => {
        setAgentPointer(null)
        setAgentActivity(null)
        queuedAgentDelayRef.current = Math.max(
          0,
          queuedAgentDelayRef.current - duration,
        )
      })

      return `Done. Opened the details for ${product.nameEn} on screen.`
    },
    [moveAgentPointerTo, showAgentPointerAtDock],
  )

  const addMenuItemWithAgent = useCallback(
    (itemId: string, quantity = 1) => {
      const product = getMenuProduct(itemId)

      if (!product) {
        return 'The requested item is not available.'
      }

      const safeQuantity = Math.max(1, Math.min(12, quantity))
      const isAlreadyOpen = selectedProductId === itemId
      const duration = isAlreadyOpen ? 1150 : 2500
      const baseDelay = queuedAgentDelayRef.current
      queuedAgentDelayRef.current += duration

      const schedule = (delay: number, callback: () => void) => {
        const timer = window.setTimeout(callback, baseDelay + delay)
        agentTimersRef.current.push(timer)
      }

      schedule(0, () => {
        if (isAlreadyOpen) {
          setAgentActivity({ productId: itemId, phase: 'reviewing' })
          showAgentPointerAtDock()
          return
        }

        setCategory('all')
        setSearch('')
        setAgentActivity({ productId: itemId, phase: 'finding' })
        showAgentPointerAtDock()
      })
      schedule(60, () => {
        if (isAlreadyOpen) {
          moveAgentPointerTo('product-detail-add-action')
          return
        }

        document.getElementById(`menu-product-${itemId}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      })
      schedule(isAlreadyOpen ? 420 : 430, () => {
        if (isAlreadyOpen) {
          moveAgentPointerTo('product-detail-add-action', true)
          setAgentActivity({ productId: itemId, phase: 'adding' })
          return
        }

        moveAgentPointerTo(`menu-product-${itemId}`)
      })
      schedule(820, () => {
        if (isAlreadyOpen) {
          return
        }

        moveAgentPointerTo(`menu-product-${itemId}`, true)
        setAgentActivity({ productId: itemId, phase: 'reviewing' })
        openProductDetails(itemId, true)
        setDetailQuantity(safeQuantity)
      })
      schedule(isAlreadyOpen ? 470 : 1080, () => {
        if (!isAlreadyOpen) {
          document.getElementById('product-detail-add-action')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      })
      schedule(isAlreadyOpen ? 500 : 1390, () => {
        if (!isAlreadyOpen) {
          moveAgentPointerTo('product-detail-add-action')
        }
      })
      schedule(isAlreadyOpen ? 520 : 1800, () => {
        moveAgentPointerTo('product-detail-add-action', true)
        setAgentActivity({ productId: itemId, phase: 'adding' })
        addMenuItem(itemId, safeQuantity)
        setCartArriving(true)
      })
      schedule(isAlreadyOpen ? 780 : 2150, () => {
        setSelectedProductId((current) => (current === itemId ? null : current))
        setDetailOpenedByAgent(false)
      })
      schedule(isAlreadyOpen ? 980 : 2350, () => {
        setAgentActivity(null)
        setAgentPointer(null)
        setCartArriving(false)
        queuedAgentDelayRef.current = Math.max(
          0,
          queuedAgentDelayRef.current - duration,
        )
      })

      return `Done. Found ${product.nameEn}, showed it on the menu, and added ${safeQuantity} to the cart.`
    },
    [
      addMenuItem,
      moveAgentPointerTo,
      selectedProductId,
      showAgentPointerAtDock,
    ],
  )

  const openCartWithAgent = useCallback(() => {
    if (cartOpen) {
      return 'Done. The cart is already open on screen.'
    }

    const duration = 1200
    const baseDelay = queuedAgentDelayRef.current
    queuedAgentDelayRef.current += duration
    const schedule = (delay: number, callback: () => void) => {
      const timer = window.setTimeout(callback, baseDelay + delay)
      agentTimersRef.current.push(timer)
    }

    schedule(0, () => {
      closeProductDetails()
      setAgentCartOpening(true)
      showAgentPointerAtDock()
    })
    schedule(100, () => {
      moveAgentPointerTo('menu-cart-trigger')
    })
    schedule(510, () => {
      moveAgentPointerTo('menu-cart-trigger', true)
    })
    schedule(720, () => {
      setCheckoutOpen(false)
      setCartOpen(true)
    })
    schedule(980, () => {
      setAgentPointer(null)
      setAgentCartOpening(false)
      queuedAgentDelayRef.current = Math.max(
        0,
        queuedAgentDelayRef.current - duration,
      )
    })

    return 'Done. Opened the shopping cart on screen.'
  }, [cartOpen, moveAgentPointerTo, showAgentPointerAtDock])

  function updateQuantity(itemId: string, quantity: number) {
    setCart((current) => {
      if (quantity <= 0) {
        const next = { ...current }
        delete next[itemId]
        return next
      }

      return { ...current, [itemId]: Math.min(12, quantity) }
    })
  }

  function resetOrder() {
    setCart({})
    setOrderComplete(false)
    setCheckoutOpen(false)
    setCartOpen(false)
    setCustomerName('')
    setTableNumber('')
  }

  function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setOrderComplete(true)
  }

  return (
    <div className="min-h-dvh overflow-x-clip bg-[#FCFCFB] text-foreground" dir={isArabic ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-40 border-b border-[#E8DED7] bg-[#FCFCFB]/95 backdrop-blur-sm">
        <div className="menu-safe-inline mx-auto flex max-w-7xl items-center justify-between gap-3 py-3">
          <Link
            href={`/${locale}`}
            aria-label={t.backHome}
            className="flex size-11 items-center justify-center rounded-full border border-[#E2D5CC] text-foreground transition-colors hover:bg-[#F6EEE8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Home className="size-5" aria-hidden="true" />
          </Link>

          <div className="text-center leading-none">
            <p className="text-xl font-bold tracking-[-0.02em] sm:text-2xl">
              Minu<span className="text-primary">Hub</span>
            </p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">{t.subtitle}</p>
          </div>

          <button
            id="menu-cart-trigger"
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`${t.cart}: ${itemCount}`}
            data-agent-cart-active={cartArriving || undefined}
            className="relative flex size-11 items-center justify-center rounded-full border border-[#E2D5CC] text-foreground transition-colors hover:bg-[#F6EEE8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ShoppingCart className="size-5" aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute -end-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="menu-safe-inline mx-auto max-w-7xl pb-56 pt-4 sm:pt-6">
        <div className="sticky top-[69px] z-30 bg-[#FCFCFB] pb-3 pt-1">
          <label className="relative block">
            <span className="sr-only">{t.search}</span>
            <Search
              className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.search}
              className="h-12 w-full rounded-full border border-[#DCCDC3] bg-white pe-4 ps-12 text-base text-foreground placeholder:text-[#7A5C4C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <nav
            aria-label={isArabic ? 'تصنيفات المنيو' : 'Menu categories'}
            className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {menuCategories.map((item) => {
              const selected = category === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setCategory(item.id)}
                  className={`min-h-11 shrink-0 rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    selected
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-[#DCCDC3] bg-white text-foreground hover:bg-[#F6EEE8]'
                  }`}
                >
                  {isArabic ? item.labelAr : item.labelEn}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="mb-4 mt-2 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            {filteredProducts.length} {t.results}
          </p>
          <p className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            {t.aiHint}
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <section
            aria-label={isArabic ? 'منتجات المنيو' : 'Menu products'}
            className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-5 xl:grid-cols-4"
          >
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                id={`menu-product-${product.id}`}
                data-agent-focused={agentActivity?.productId === product.id || undefined}
                className="min-w-0 scroll-mt-44 rounded-[14px]"
              >
                <button
                  type="button"
                  onClick={() => openProductDetails(product.id)}
                  aria-label={`${t.details}: ${isArabic ? product.nameAr : product.nameEn}`}
                  className="relative block aspect-square w-full overflow-hidden rounded-[14px] bg-[#F1E7E0] text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Image
                    src={product.image}
                    alt={isArabic ? product.nameAr : product.nameEn}
                    fill
                    sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
                    loading={product.id === 'classic-cheeseburger' ? 'eager' : 'lazy'}
                    className="object-cover transition-transform duration-200 ease-out hover:scale-[1.03] motion-reduce:transition-none"
                  />
                  {product.popular && (
                    <span className="absolute end-2 top-2 rounded-full bg-sunshine px-2.5 py-1 text-xs font-bold text-foreground">
                      {t.popular}
                    </span>
                  )}
                </button>

                <div className="pt-3">
                  <h2 className="truncate text-base font-bold text-foreground sm:text-lg">
                    <button
                      type="button"
                      onClick={() => openProductDetails(product.id)}
                      className="max-w-full truncate text-start hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {isArabic ? product.nameAr : product.nameEn}
                    </button>
                  </h2>
                  <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
                    {isArabic ? product.descriptionAr : product.descriptionEn}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-base font-bold tabular-nums text-primary sm:text-lg">
                      {formatPrice(product.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => addMenuItem(product.id)}
                      className="flex min-h-11 items-center gap-1 rounded-full border border-primary px-3 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-[#A83C21]"
                    >
                      <Plus className="size-4" aria-hidden="true" />
                      {t.add}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
            <Search className="size-10 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold">{t.emptyResults}</h2>
            <p className="mt-2 text-muted-foreground">{t.emptyResultsHint}</p>
          </div>
        )}
      </main>

      {activityProduct && agentActivity && (
        <div
          role="status"
          aria-live="polite"
          className="agent-status-enter z-toast fixed left-1/2 top-20 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-[14px] bg-foreground px-4 py-3 text-white shadow-sm"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white/75">
              {agentActivity.phase === 'finding'
                ? t.agentFinding
                : agentActivity.phase === 'reviewing'
                  ? t.agentReviewing
                  : t.agentAdding}
            </p>
            <p className="truncate font-bold">
              {isArabic ? activityProduct.nameAr : activityProduct.nameEn}
            </p>
          </div>
          <span className="flex gap-1" aria-hidden="true">
            {(['finding', 'reviewing', 'adding'] as const).map((phase) => (
              <span
                key={phase}
                className={`size-1.5 rounded-full ${
                  phase === agentActivity.phase ? 'bg-sunshine' : 'bg-white/30'
                }`}
              />
            ))}
          </span>
        </div>
      )}

      {agentCartOpening && (
        <div
          role="status"
          aria-live="polite"
          className="agent-status-enter z-toast fixed left-1/2 top-20 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-[14px] bg-foreground px-4 py-3 text-white shadow-sm"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ShoppingCart className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white/75">{isArabic ? 'Minu بتتحرك دلوقتي' : 'Minu is moving now'}</p>
            <p className="truncate font-bold">{isArabic ? 'بفتحلك السلة' : 'Opening your cart'}</p>
          </div>
        </div>
      )}

      {agentPointer && (
        <div
          aria-hidden="true"
          className="agent-pointer-shell"
          style={{
            transform: `translate3d(${agentPointer.x}px, ${agentPointer.y}px, 0)`,
          }}
        >
          <span className="agent-pointer-label">Minu</span>
          <span
            className="agent-pointer-hand"
            data-pressed={agentPointer.pressed || undefined}
          >
            <Hand className="size-8" strokeWidth={2.4} />
          </span>
        </div>
      )}

      {selectedProduct && selectedProductDetails && !cartOpen && (
        <div className="z-modal fixed inset-0">
          <button
            type="button"
            aria-label={isArabic ? 'إغلاق تفاصيل المنتج' : 'Close product details'}
            onClick={closeProductDetails}
            className="menu-sheet-backdrop z-modal-backdrop absolute inset-0 bg-black/35"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-detail-title"
            id="product-detail-panel"
            className="menu-sheet-panel z-modal-panel absolute inset-x-0 bottom-0 max-h-[92dvh] max-w-full overscroll-contain overflow-y-auto rounded-t-[16px] bg-white pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:inset-y-8 sm:end-8 sm:start-auto sm:w-[30rem] sm:rounded-[16px]"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted sm:rounded-t-[16px]">
              <Image
                src={selectedProduct.image}
                alt={isArabic ? selectedProduct.nameAr : selectedProduct.nameEn}
                fill
                sizes="(max-width: 639px) 100vw, 480px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={closeProductDetails}
                aria-label={isArabic ? 'إغلاق تفاصيل المنتج' : 'Close product details'}
                className="absolute end-3 top-3 flex size-11 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
              {detailOpenedByAgent && (
                <span className="absolute start-3 top-3 flex items-center gap-1.5 rounded-full bg-foreground px-3 py-2 text-sm font-semibold text-white">
                  <Sparkles className="size-4 text-sunshine" aria-hidden="true" />
                  {isArabic ? 'Minu اختارت ده لطلبك' : 'Minu picked this for your order'}
                </span>
              )}
            </div>

            <div className="px-4 pt-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="product-detail-title" className="text-2xl font-bold text-foreground">
                    {isArabic ? selectedProduct.nameAr : selectedProduct.nameEn}
                  </h2>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    {isArabic
                      ? selectedProduct.descriptionAr
                      : selectedProduct.descriptionEn}
                  </p>
                </div>
                <p className="shrink-0 text-xl font-bold tabular-nums text-primary">
                  {formatPrice(selectedProduct.price)}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-y border-border py-4 text-sm font-semibold text-foreground">
                <span className="flex items-center gap-2">
                  <Clock3 className="size-4 text-primary" aria-hidden="true" />
                  {selectedProductDetails.prepMinutes} {t.minutes}
                </span>
                <span className="flex items-center gap-2">
                  <Flame className="size-4 text-primary" aria-hidden="true" />
                  {selectedProductDetails.calories} {t.calories}
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold text-muted-foreground">
                {isArabic
                  ? selectedProductDetails.servingAr
                  : selectedProductDetails.servingEn}
              </p>

              <div className="mt-5">
                <h3 className="font-bold">{t.ingredients}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {(isArabic
                    ? selectedProductDetails.ingredientsAr
                    : selectedProductDetails.ingredientsEn
                  ).map((ingredient) => (
                    <li
                      key={ingredient}
                      className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground"
                    >
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-12 shrink-0 items-center rounded-full border border-border">
                  <button
                    type="button"
                    onClick={() => setDetailQuantity((current) => Math.max(1, current - 1))}
                    aria-label={`- ${t.quantity}`}
                    className="flex size-11 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Minus className="size-4" aria-hidden="true" />
                  </button>
                  <span className="w-7 text-center font-bold tabular-nums">{detailQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setDetailQuantity((current) => Math.min(12, current + 1))}
                    aria-label={`+ ${t.quantity}`}
                    className="flex size-11 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <button
                  id="product-detail-add-action"
                  type="button"
                  onClick={() => {
                    addMenuItem(selectedProduct.id, detailQuantity)
                    closeProductDetails()
                  }}
                  className="min-h-12 flex-1 rounded-full bg-primary px-5 font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {t.addToCart} · {formatPrice(selectedProduct.price * detailQuantity)}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {itemCount > 0 && !cartOpen && (
        <button
          id="menu-cart-summary"
          type="button"
          onClick={() => setCartOpen(true)}
          data-agent-cart-active={cartArriving || undefined}
          className="fixed bottom-[108px] left-1/2 z-40 flex min-h-14 w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 items-center justify-between gap-3 rounded-[14px] bg-foreground px-4 text-start text-white shadow-sm transition-colors hover:bg-[#2B120D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="size-5" aria-hidden="true" />
            {itemCount} {t.cart}
          </span>
          <span className="font-bold tabular-nums">{formatPrice(total)}</span>
        </button>
      )}

      {toast && (
        <p
          role="status"
          className="fixed bottom-[174px] left-1/2 z-40 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-2 rounded-full bg-[#E6F7EE] px-4 py-2 text-center text-sm font-semibold text-[#17643A] shadow-sm"
        >
          <Check className="size-4" aria-hidden="true" />
          {toast}
        </p>
      )}

      {cartOpen && (
        <div className="z-modal fixed inset-0">
          <button
            type="button"
            aria-label={t.close}
            onClick={() => setCartOpen(false)}
            className="menu-sheet-backdrop z-modal-backdrop absolute inset-0 bg-black/35"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="menu-sheet-panel z-modal-panel absolute inset-x-0 bottom-0 max-h-[88dvh] max-w-full overscroll-contain overflow-y-auto rounded-t-[16px] bg-white px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:inset-y-0 sm:end-0 sm:start-auto sm:max-h-none sm:w-[28rem] sm:rounded-none sm:px-6"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h2 id="cart-title" className="text-xl font-bold">
                  {checkoutOpen ? t.orderTitle : t.cart}
                </h2>
                {!checkoutOpen && itemCount > 0 && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {itemCount} {isArabic ? 'صنف' : itemCount === 1 ? 'item' : 'items'}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label={t.close}
                className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            {orderComplete ? (
              <div className="flex flex-col items-center py-12 text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-[#E6F7EE] text-[#17643A]">
                  <Check className="size-8" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-2xl font-bold">{t.successTitle}</h3>
                <p className="mt-2 max-w-sm leading-7 text-muted-foreground">{t.successText}</p>
                <button
                  type="button"
                  onClick={resetOrder}
                  className="mt-6 min-h-12 rounded-full bg-primary px-6 font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {t.newOrder}
                </button>
              </div>
            ) : checkoutOpen ? (
              <form onSubmit={placeOrder} className="py-5">
                <label className="block text-sm font-semibold">
                  {t.name}
                  <input
                    required
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder={t.namePlaceholder}
                    className="mt-2 h-12 w-full rounded-[12px] border border-input px-4 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>

                <fieldset className="mt-5">
                  <legend className="text-sm font-semibold">{t.orderType}</legend>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(['table', 'pickup'] as const).map((type) => (
                      <label
                        key={type}
                        className={`flex min-h-12 cursor-pointer items-center justify-center rounded-[12px] border px-3 text-center text-sm font-semibold ${
                          orderType === type
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-input text-foreground'
                        }`}
                      >
                        <input
                          type="radio"
                          name="orderType"
                          value={type}
                          checked={orderType === type}
                          onChange={() => setOrderType(type)}
                          className="sr-only"
                        />
                        {type === 'table' ? t.table : t.pickup}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {orderType === 'table' && (
                  <label className="mt-5 block text-sm font-semibold">
                    {t.tableNumber}
                    <input
                      required
                      inputMode="numeric"
                      value={tableNumber}
                      onChange={(event) => setTableNumber(event.target.value)}
                      className="mt-2 h-12 w-full rounded-[12px] border border-input px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>
                )}

                <div className="mt-8 flex items-center justify-between border-t border-border pt-4 text-lg font-bold">
                  <span>{t.total}</span>
                  <span className="tabular-nums text-primary">{formatPrice(total)}</span>
                </div>
                <button
                  type="submit"
                  className="mt-4 min-h-12 w-full rounded-full bg-primary px-5 font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {t.placeOrder}
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  className="mt-2 min-h-11 w-full text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ChevronDown className="me-1 inline size-4 rotate-180" aria-hidden="true" />
                  {t.cart}
                </button>
              </form>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-center">
                <ShoppingCart className="size-10 text-muted-foreground" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-bold">{t.cartEmpty}</h3>
                <p className="mt-2 max-w-xs leading-6 text-muted-foreground">{t.cartEmptyHint}</p>
              </div>
            ) : (
              <div className="py-2">
                <ul>
                  {cartItems.map(({ product, quantity }) => (
                    <li key={product.id} className="flex gap-3 border-b border-border py-4">
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-[12px] bg-muted">
                        <Image
                          src={product.image}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold">
                              {isArabic ? product.nameAr : product.nameEn}
                            </h3>
                            <p className="mt-1 text-sm font-semibold tabular-nums text-primary">
                              {formatPrice(product.price * quantity)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, 0)}
                            aria-label={`${t.remove} ${isArabic ? product.nameAr : product.nameEn}`}
                            className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="mt-2 flex w-fit items-center rounded-full border border-border">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            aria-label={`- ${isArabic ? product.nameAr : product.nameEn}`}
                            className="flex size-10 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Minus className="size-4" aria-hidden="true" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold tabular-nums">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            aria-label={`+ ${isArabic ? product.nameAr : product.nameEn}`}
                            className="flex size-10 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Plus className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-5 text-lg font-bold">
                  <span>{t.total}</span>
                  <span className="tabular-nums text-primary">{formatPrice(total)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(true)}
                  className="mt-4 min-h-12 w-full rounded-full bg-primary px-5 font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {t.checkout}
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      <div
        aria-hidden={cartOpen || undefined}
        className={cartOpen ? 'pointer-events-none invisible' : undefined}
      >
        <VoiceConcierge
          locale={locale}
          variant="menu-dock"
          onAddMenuItem={addMenuItemWithAgent}
          onShowMenuItem={showMenuItemWithAgent}
          onOpenCart={openCartWithAgent}
        />
      </div>
    </div>
  )
}
