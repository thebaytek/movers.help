"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { calculateQuote } from "@/lib/pricing";
import { ROOMS, getItemsForRoom, getCuFt, calculateTotalCuFt } from "@/lib/inventory";
import {
  MapPin,
  Calendar,
  Package,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Sparkles,
} from "lucide-react";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

const QUICK_ROUTES = [
  { label: "NYC → LA", fromCity: "New York", fromState: "NY", toCity: "Los Angeles", toState: "CA" },
  { label: "Austin → Denver", fromCity: "Austin", fromState: "TX", toCity: "Denver", toState: "CO" },
  { label: "Chicago → Miami", fromCity: "Chicago", fromState: "IL", toCity: "Miami", toState: "FL" },
];

const ROOM_KEYS = Object.keys(ROOMS);

interface InventoryEntry {
  item: string;
  quantity: number;
  room: string;
}

const stepOneSchema = z.object({
  fromCity: z.string().min(1, "Required"),
  fromState: z.string().min(1, "Required"),
  toCity: z.string().min(1, "Required"),
  toState: z.string().min(1, "Required"),
  moveDate: z.string().min(1, "Required"),
});

const stepThreeSchema = z.object({
  needsPacking: z.boolean(),
  needsStorage: z.boolean(),
  storageDays: z.coerce.number().min(1, "Min 1 day").optional(),
  accessibility: z.enum(["ground", "elevator", "stairs"]),
  name: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
});

const fullSchema = stepOneSchema.merge(stepThreeSchema);

type FormValues = z.infer<typeof fullSchema>;

const STEP_LABELS = ["Move Details", "Inventory", "Options & Contact", "Review & Submit"];

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === current;
        const isDone = stepNum < current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                  isDone && "bg-brand-600 text-white",
                  isActive && "bg-brand-600 text-white ring-4 ring-brand-500/20",
                  !isDone && !isActive && "bg-surface-100 dark:bg-surface-800 text-surface-400"
                )}
              >
                {isDone ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span
                className={cn(
                  "text-xs mt-2 font-medium hidden sm:block",
                  isActive ? "text-brand-600 dark:text-brand-400" : "text-surface-400"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={cn(
                  "w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-colors duration-300",
                  stepNum < current ? "bg-brand-600" : "bg-surface-200 dark:bg-surface-700"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function QuoteSection() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [inventory, setInventory] = useState<InventoryEntry[]>([]);
  const [activeRoom, setActiveRoom] = useState(ROOM_KEYS[0]);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemRoom, setCustomItemRoom] = useState(ROOM_KEYS[0]);
  const [showCustomItem, setShowCustomItem] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      fromCity: "",
      fromState: "",
      toCity: "",
      toState: "",
      moveDate: "",
      needsPacking: false,
      needsStorage: false,
      storageDays: 7,
      accessibility: "ground",
      name: "",
      email: "",
      phone: "",
    },
    mode: "onChange",
  });

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = form;
  const needsStorage = watch("needsStorage");
  const needsPacking = watch("needsPacking");

  function goToStep(step: number) {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  }

  async function handleNext() {
    if (currentStep === 1) {
      const valid = await trigger(["fromCity", "fromState", "toCity", "toState", "moveDate"]);
      if (!valid) return;
    }
    if (currentStep === 2) {
      if (inventory.length === 0) return;
    }
    if (currentStep === 3) {
      const valid = await trigger(["name", "email", "phone"]);
      if (!valid) return;
    }
    goToStep(currentStep + 1);
  }

  function handleBack() {
    if (currentStep > 1) goToStep(currentStep - 1);
  }

  function addInventoryItem(itemName: string) {
    setInventory((prev) => {
      const existing = prev.find((e) => e.item === itemName);
      if (existing) {
        return prev.map((e) =>
          e.item === itemName ? { ...e, quantity: e.quantity + 1 } : e
        );
      }
      return [...prev, { item: itemName, quantity: 1, room: activeRoom }];
    });
  }

  function removeInventoryItem(itemName: string) {
    setInventory((prev) => {
      const existing = prev.find((e) => e.item === itemName);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((e) => e.item !== itemName);
      }
      return prev.map((e) =>
        e.item === itemName ? { ...e, quantity: e.quantity - 1 } : e
      );
    });
  }

  function getQuantity(itemName: string): number {
    return inventory.find((e) => e.item === itemName)?.quantity ?? 0;
  }

  function addCustomItem() {
    if (!customItemName.trim()) return;
    setInventory((prev) => {
      const existing = prev.find((e) => e.item === customItemName.trim());
      if (existing) {
        return prev.map((e) =>
          e.item === customItemName.trim() ? { ...e, quantity: e.quantity + 1 } : e
        );
      }
      return [...prev, { item: customItemName.trim(), quantity: 1, room: customItemRoom }];
    });
    setCustomItemName("");
    setShowCustomItem(false);
  }

  const totalItems = inventory.reduce((sum, e) => sum + e.quantity, 0);
  const totalCuFt = calculateTotalCuFt(
    inventory.map((e) => ({ item: e.item, quantity: e.quantity }))
  );

  const quoteResult = useMemo(() => {
    const vals = form.getValues();
    if (!vals.fromCity || !vals.toCity || !vals.moveDate || inventory.length === 0) return null;
    return calculateQuote(
      {
        fromCity: vals.fromCity,
        fromState: vals.fromState,
        toCity: vals.toCity,
        toState: vals.toState,
        moveDate: vals.moveDate,
      },
      inventory.map((e) => ({ item: e.item, quantity: e.quantity, room: e.room, cuFtPerItem: getCuFt(e.item) })),
      {
        needsPacking: vals.needsPacking,
        needsStorage: vals.needsStorage,
        storageDays: vals.storageDays || 7,
        hasStairs: vals.accessibility === "stairs",
        hasElevator: vals.accessibility === "elevator",
      }
    );
  }, [inventory, form.watch()]);

  async function onSubmit(values: FormValues) {
    if (!quoteResult) return;
    setIsSubmitting(true);
    try {
      const body = {
        ...values,
        inventory,
        totalItems,
        totalCuFt,
        distanceMiles: quoteResult.distanceMiles,
        estimatedTotal: quoteResult.estimatedTotal,
        breakdown: quoteResult.breakdown,
      };
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        console.error("Lead submission failed:", res.status, data);
      }
    } catch (err) {
      console.error("Lead submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function quickFill(fromCity: string, fromState: string, toCity: string, toState: string) {
    setValue("fromCity", fromCity, { shouldValidate: true });
    setValue("fromState", fromState, { shouldValidate: true });
    setValue("toCity", toCity, { shouldValidate: true });
    setValue("toState", toState, { shouldValidate: true });
  }

  if (submitted) {
    return (
      <section id="quote" className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center"
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Check className="w-10 h-10 text-brand-600 dark:text-brand-400" />
            </motion.div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-display font-bold gradient-text mb-4"
          >
            Quote submitted!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-surface-600 dark:text-surface-400 text-lg"
          >
            We&apos;ll connect you with verified movers within 24 hours.
          </motion.p>
          {quoteResult && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-4 text-2xl font-bold text-surface-900 dark:text-surface-100"
            >
              Estimated: {formatCurrency(quoteResult.estimatedTotal)}
            </motion.p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section id="quote" className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-display font-bold gradient-text mb-4">
            Get Your Quote
          </h2>
          <p className="text-surface-600 dark:text-surface-400 text-lg max-w-xl mx-auto text-balance">
            Tell us about your move and inventory for an instant, all-in price estimate
          </p>
        </div>

        <StepIndicator current={currentStep} />

        <Card className="overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-brand-500" />
                        Where are you moving?
                      </h3>
                      <p className="text-sm text-surface-500 mt-1">Enter your origin and destination</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {QUICK_ROUTES.map((route) => (
                        <button
                          key={route.label}
                          type="button"
                          onClick={() => quickFill(route.fromCity, route.fromState, route.toCity, route.toState)}
                          className="px-3 py-1.5 text-xs font-medium rounded-full border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                        >
                          {route.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                          From City
                        </label>
                        <Input {...register("fromCity")} placeholder="New York" />
                        {errors.fromCity && (
                          <p className="text-red-500 text-xs mt-1">{errors.fromCity.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                          From State
                        </label>
                        <select
                          {...register("fromState")}
                          className="flex h-11 w-full rounded-xl border-2 border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-4 py-2 text-sm text-surface-900 dark:text-surface-100 focus-visible:outline-none focus-visible:border-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/10 transition-all duration-200"
                        >
                          <option value="">Select state</option>
                          {US_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {errors.fromState && (
                          <p className="text-red-500 text-xs mt-1">{errors.fromState.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                          To City
                        </label>
                        <Input {...register("toCity")} placeholder="Los Angeles" />
                        {errors.toCity && (
                          <p className="text-red-500 text-xs mt-1">{errors.toCity.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                          To State
                        </label>
                        <select
                          {...register("toState")}
                          className="flex h-11 w-full rounded-xl border-2 border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-4 py-2 text-sm text-surface-900 dark:text-surface-100 focus-visible:outline-none focus-visible:border-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/10 transition-all duration-200"
                        >
                          <option value="">Select state</option>
                          {US_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {errors.toState && (
                          <p className="text-red-500 text-xs mt-1">{errors.toState.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                        Move Date
                      </label>
                      <Input
                        type="date"
                        min={getTomorrow()}
                        {...register("moveDate")}
                      />
                      {errors.moveDate && (
                        <p className="text-red-500 text-xs mt-1">{errors.moveDate.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={handleNext} size="lg">
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                        <Package className="w-5 h-5 text-brand-500" />
                        What are you moving?
                      </h3>
                      <p className="text-sm text-surface-500 mt-1">
                        Add items from each room to build your inventory
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {ROOM_KEYS.map((room) => (
                        <button
                          key={room}
                          type="button"
                          onClick={() => setActiveRoom(room)}
                          className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
                            activeRoom === room
                              ? "bg-brand-600 text-white"
                              : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700"
                          )}
                        >
                          {room}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                      {getItemsForRoom(activeRoom).map((itemName) => {
                        const qty = getQuantity(itemName);
                        const cuFt = getCuFt(itemName);
                        return (
                          <div
                            key={itemName}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border transition-all",
                              qty > 0
                                ? "border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/20"
                                : "border-surface-200 dark:border-surface-800"
                            )}
                          >
                            <div>
                              <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                                {itemName}
                              </p>
                              <p className="text-xs text-surface-500">{cuFt} cu ft each</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                disabled={qty === 0}
                                onClick={() => removeInventoryItem(itemName)}
                                className="w-8 h-8 rounded-lg border border-surface-200 dark:border-surface-700 flex items-center justify-center text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold tabular-nums">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => addInventoryItem(itemName)}
                                className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-900 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {showCustomItem ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2 items-end"
                      >
                        <div className="flex-1">
                          <Input
                            placeholder="Item name"
                            value={customItemName}
                            onChange={(e) => setCustomItemName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
                          />
                        </div>
                        <select
                          value={customItemRoom}
                          onChange={(e) => setCustomItemRoom(e.target.value)}
                          className="h-11 rounded-xl border-2 border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-3 text-sm text-surface-900 dark:text-surface-100 focus-visible:outline-none focus-visible:border-brand-500 transition-all"
                        >
                          {ROOM_KEYS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <Button size="sm" onClick={addCustomItem}>
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowCustomItem(false)}
                        >
                          Cancel
                        </Button>
                      </motion.div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowCustomItem(true)}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-surface-200 dark:border-surface-700 text-sm text-surface-500 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      >
                        + Add Custom Item
                      </button>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-surface-100 dark:border-surface-800">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{totalItems} items</Badge>
                        <Badge variant="secondary">{totalCuFt.toLocaleString()} cu ft</Badge>
                      </div>
                      <Button onClick={handleNext} size="lg" disabled={inventory.length === 0}>
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-500" />
                        Options & Contact
                      </h3>
                      <p className="text-sm text-surface-500 mt-1">
                        Choose extras and tell us how to reach you
                      </p>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          {...register("needsPacking")}
                          className="mt-0.5 w-4 h-4 rounded border-surface-300 dark:border-surface-700 text-brand-600 focus:ring-brand-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-surface-900 dark:text-surface-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            Need packing service?
                          </p>
                          <p className="text-xs text-surface-500">+$1.25/cu ft — we pack everything for you</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          {...register("needsStorage")}
                          className="mt-0.5 w-4 h-4 rounded border-surface-300 dark:border-surface-700 text-brand-600 focus:ring-brand-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-surface-900 dark:text-surface-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            Need storage?
                          </p>
                          <p className="text-xs text-surface-500">$25/day — secure warehouse storage</p>
                        </div>
                      </label>

                      {needsStorage && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="ml-7"
                        >
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                            How many days?
                          </label>
                          <Input
                            type="number"
                            min={1}
                            {...register("storageDays", { valueAsNumber: true })}
                            className="w-32"
                          />
                        </motion.div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                        Accessibility
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { value: "ground", label: "Ground floor" },
                          { value: "elevator", label: "Has elevator" },
                          { value: "stairs", label: "Has stairs" },
                        ].map((opt) => (
                          <label
                            key={opt.value}
                            className={cn(
                              "px-4 py-2 rounded-xl border-2 text-sm font-medium cursor-pointer transition-all",
                              watch("accessibility") === opt.value
                                ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300"
                                : "border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300"
                            )}
                          >
                            <input
                              type="radio"
                              value={opt.value}
                              {...register("accessibility")}
                              className="sr-only"
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                          Full Name
                        </label>
                        <Input {...register("name")} placeholder="John Doe" />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                          Email
                        </label>
                        <Input {...register("email")} type="email" placeholder="john@example.com" />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                          Phone
                        </label>
                        <Input {...register("phone")} type="tel" placeholder="(555) 123-4567" />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={handleNext} size="lg">
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 4 && quoteResult && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                        <Check className="w-5 h-5 text-brand-500" />
                        Review Your Quote
                      </h3>
                      <p className="text-sm text-surface-500 mt-1">Here&apos;s your estimated all-in price</p>
                    </div>

                    <div className="space-y-3 p-4 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                      <div className="flex justify-between text-sm">
                        <span className="text-surface-500">Move</span>
                        <span className="font-medium text-surface-900 dark:text-surface-100">
                          {form.getValues("fromCity")}, {form.getValues("fromState")} →{" "}
                          {form.getValues("toCity")}, {form.getValues("toState")}
                          <span className="text-surface-400 ml-1">
                            ({quoteResult.distanceMiles.toLocaleString()} mi)
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-surface-500">Date</span>
                        <span className="font-medium text-surface-900 dark:text-surface-100">
                          {formatDate(form.getValues("moveDate"))}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-surface-500">Volume</span>
                        <span className="font-medium text-surface-900 dark:text-surface-100">
                          {totalItems} items, {totalCuFt.toLocaleString()} cu ft
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {quoteResult.breakdown.map((line) => (
                        <div key={line.label} className="flex justify-between text-sm">
                          <span className="text-surface-500">
                            {line.label}
                            {line.description && (
                              <span className="text-surface-400 ml-1 text-xs">({line.description})</span>
                            )}
                          </span>
                          <span className="font-medium text-surface-900 dark:text-surface-100">
                            {formatCurrency(line.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-3 mt-3 border-t-2 border-surface-200 dark:border-surface-700">
                        <span className="text-lg font-bold text-surface-900 dark:text-surface-100">Total</span>
                        <span className="text-2xl font-bold gradient-text">
                          {formatCurrency(quoteResult.estimatedTotal)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-surface-400 text-center">
                      This is an estimate. Final price may vary by up to 5% based on actual inventory verification.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          className="mt-0.5 w-4 h-4 rounded border-surface-300 dark:border-surface-700 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-surface-600 dark:text-surface-400">
                          I understand this is an estimate and agree to be contacted about my move
                        </span>
                      </label>

                      <div className="flex justify-end pt-2">
                        <Button type="submit" size="xl" variant="accent" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                              />
                              Submitting...
                            </>
                          ) : (
                            <>
                              Submit & Get Matched <Sparkles className="w-4 h-4 ml-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {currentStep > 1 && currentStep < 4 && (
              <div className="mt-6">
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
