import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle } from "lucide-react"

interface ErrorMessageProps {
  error: string | null
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 rounded-base border-2 border-border bg-red-50 dark:bg-red-950 shadow-shadow"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm font-heading text-red-600 dark:text-red-400 whitespace-pre-wrap break-words max-h-32 overflow-y-auto leading-relaxed">
              {error}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
