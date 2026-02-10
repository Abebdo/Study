"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CreditCard,
  Lock,
  Star,
  Users,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  Tag,
  Sparkles,
  Shield,
  Zap,
  Gift,
} from "lucide-react"
import { allCourses } from "@/lib/courses-data"
import { cn } from "@/lib/utils"
import { usePlatform } from "@/lib/auth-context"

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const courseId = Number.parseInt(id)
  const course = allCourses.find(c => c.id === courseId) || allCourses[0]
  const { isEnrolled, enrollInCourse, validateDiscount, useDiscountCode } = usePlatform()

  const [discountCode, setDiscountCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number; type: "percentage" | "fixed" } | null>(null)
  const [discountError, setDiscountError] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const applyDiscount = () => {
    setDiscountError("")
    const result = validateDiscount(discountCode)
    if (result.valid && result.discount) {
      setAppliedDiscount({
        code: result.discount.code,
        amount: result.discount.discount,
        type: result.discount.type,
      })
    } else {
      setDiscountError(result.error || "Invalid code.")
    }
  }

  const originalPrice = course.originalPrice || course.price
  const courseDiscount = originalPrice - course.price
  const additionalDiscount = appliedDiscount
    ? appliedDiscount.type === "percentage"
      ? (course.price * appliedDiscount.amount) / 100
      : appliedDiscount.amount
    : 0
  const finalPrice = Math.max(0, course.price - additionalDiscount)

  const handlePayment = () => {
    setIsProcessing(true)
    setTimeout(() => {
      // Actually enroll the student
      enrollInCourse(courseId)
      setIsProcessing(false)
      setIsComplete(true)
    }, 2000)
  }

  if (isComplete) {
    useDiscountCode(courseId) // Ensure useDiscountCode is called at the top level
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
          <h1 className="mb-2 font-heading text-2xl font-bold text-foreground">Payment Successful!</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            You are now enrolled in <strong>{course.title}</strong>. Start learning right away!
          </p>
          <div className="mb-6 rounded-2xl bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${course.color}`}>
                <span className="text-sm font-bold text-white">{course.icon}</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">{course.title}</p>
                <p className="text-xs text-muted-foreground">{course.instructor}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href={`/dashboard/courses/${course.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              <Zap className="h-4 w-4" />
              Start Learning Now
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-border py-3 text-sm font-medium text-foreground hover:bg-muted"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6">
      <Link
        href={`/dashboard/courses/${course.id}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to course
      </Link>

      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">Checkout</h1>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Payment Form */}
          <div className="flex-1 space-y-6">
            {/* Payment Method */}
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Payment Method</h2>
              <div className="mb-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-colors",
                    paymentMethod === "card" ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  <CreditCard className="h-4 w-4" />
                  Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-colors",
                    paymentMethod === "paypal" ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  PayPal
                </button>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardName" className="mb-1.5 block text-sm font-medium text-muted-foreground">Name on Card</label>
                    <input id="cardName" type="text" placeholder="Ronald Richards" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label htmlFor="cardNumber" className="mb-1.5 block text-sm font-medium text-muted-foreground">Card Number</label>
                    <div className="relative">
                      <input id="cardNumber" type="text" placeholder="1234 5678 9012 3456" maxLength={19} className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-12 text-sm text-foreground outline-none focus:border-primary" />
                      <CreditCard className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry" className="mb-1.5 block text-sm font-medium text-muted-foreground">Expiry Date</label>
                      <input id="expiry" type="text" placeholder="MM/YY" maxLength={5} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="mb-1.5 block text-sm font-medium text-muted-foreground">CVV</label>
                      <input id="cvv" type="text" placeholder="123" maxLength={4} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "paypal" && (
                <div className="flex flex-col items-center rounded-xl border border-border py-8">
                  <p className="mb-4 text-sm text-muted-foreground">You will be redirected to PayPal to complete payment</p>
                  <div className="flex h-12 w-32 items-center justify-center rounded-lg bg-blue-500 text-sm font-bold text-white">PayPal</div>
                </div>
              )}
            </div>

            {/* Discount Code */}
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
                <Gift className="h-5 w-5 text-secondary" />
                Discount Code
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => { setDiscountCode(e.target.value); setDiscountError("") }}
                    placeholder="Enter discount code..."
                    className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 font-mono text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyDiscount}
                  disabled={!discountCode.trim()}
                  className="rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
              {discountError && <p className="mt-2 text-xs text-destructive">{discountError}</p>}
              {appliedDiscount && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-700">
                    Code <span className="font-mono font-bold">{appliedDiscount.code}</span> applied - {appliedDiscount.type === "percentage" ? `${appliedDiscount.amount}% off` : `$${appliedDiscount.amount} off`}
                  </span>
                  <button type="button" onClick={() => setAppliedDiscount(null)} className="ml-auto text-xs text-emerald-600 underline">Remove</button>
                </div>
              )}
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-secondary" />
                Try codes: WELCOME50, NEWCOURSE, SAVE10
              </p>
            </div>

            {/* Security */}
            <div className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm">
              <Shield className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-foreground">Secure Payment</p>
                <p className="text-xs text-muted-foreground">Your payment is protected with 256-bit SSL encryption. 30-day money-back guarantee.</p>
              </div>
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-80">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Order Summary</h2>
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${course.color}`}>
                    <span className="text-sm font-bold text-white">{course.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{course.title}</h3>
                    <p className="text-xs text-muted-foreground">{course.instructor}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{course.rating}</span>
                      <span className="flex items-center gap-0.5"><Users className="h-3 w-3" />{course.students.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 space-y-2 border-t border-border pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Original Price</span>
                    <span className="text-muted-foreground line-through">${originalPrice}</span>
                  </div>
                  {courseDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Course Discount</span>
                      <span className="font-medium text-emerald-600">-${courseDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {appliedDiscount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Code: {appliedDiscount.code}</span>
                      <span className="font-medium text-emerald-600">-${additionalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="font-heading text-lg font-bold text-foreground">Total</span>
                  <span className="font-heading text-2xl font-bold text-foreground">${finalPrice.toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-70"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pay ${finalPrice.toFixed(2)}
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-2xl bg-card p-5 shadow-sm">
                <h3 className="mb-3 font-heading text-sm font-semibold text-foreground">What you get</h3>
                <ul className="space-y-2">
                  {[
                    { icon: BookOpen, text: `${course.lessons} lessons` },
                    { icon: Clock, text: `${course.duration} of content` },
                    { icon: Award, text: "Certificate of completion" },
                    { icon: Zap, text: "Lifetime access" },
                  ].map((item) => (
                    <li key={item.text} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <item.icon className="h-3.5 w-3.5 text-secondary" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
