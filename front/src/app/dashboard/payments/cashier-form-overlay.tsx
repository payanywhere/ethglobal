"use client"

import { Loader2 } from "lucide-react"
import { memo, useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMerchant } from "@/contexts/merchant-context"
import { createCashier } from "@/services/api"

interface CashierFormOverlayProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export const CashierFormOverlay = memo(function CashierFormOverlay({
  open,
  onClose,
  onSuccess
}: CashierFormOverlayProps) {
  const { walletAddress, refreshCashiers } = useMerchant()
  const [name, setName] = useState<string>("")
  const [status, setStatus] = useState<boolean>(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setError(null)
    }
  }, [open])

  const handleClose = useCallback(() => {
    if (!loading) {
      setName("")
      setStatus(true)
      setError(null)
      onClose()
    }
  }, [loading, onClose])

  const createCashierHandler = useCallback(async () => {
    if (!name.trim()) {
      setError("Name is required")
      return
    }
    if (!walletAddress) {
      setError("Merchant address not found")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await createCashier({
        merchantAddress: walletAddress,
        name: name.trim(),
        status: status ? "enabled" : "disabled"
      })
      await refreshCashiers()
      onSuccess()
      handleClose()
    } catch (e) {
      console.error("Error creating cashier", e)
      setError(e instanceof Error ? e.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [name, status, walletAddress, refreshCashiers, onSuccess, handleClose])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Cashier</DialogTitle>
          <DialogDescription>Crea un nuevo cashier para tu merchant</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="p-4 rounded-base border-2 border-border bg-red-50 dark:bg-red-950 shadow-shadow">
              <p className="text-sm font-heading text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-heading">
              Nombre
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del cashier"
              disabled={loading}
              className="text-lg"
            />
            <p className="text-sm text-foreground/50 font-base">Enter the name of the cashier</p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="status"
              checked={status}
              onCheckedChange={(checked) => setStatus(checked === true)}
              disabled={loading}
            />
            <Label htmlFor="status" className="text-base font-heading cursor-pointer">
              Enabled
            </Label>
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2 w-full">
            <Button
              onClick={handleClose}
              variant="neutral"
              disabled={loading}
              className="flex-1 h-12 text-lg !font-heading !font-bold"
              size="lg"
            >
              Cancel
            </Button>
            <Button
              onClick={createCashierHandler}
              disabled={loading || !name.trim() || !walletAddress}
              variant="default"
              className="flex-1 h-12 text-lg !font-heading !font-bold"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Creating...
                </>
              ) : (
                "Create cashier"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
