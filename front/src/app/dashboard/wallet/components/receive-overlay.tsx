"use client"

import { Check, Copy, ExternalLink } from "lucide-react"
import QRCode from "qrcode"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

interface ReceiveOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: string
}

export function ReceiveOverlay({ open, onOpenChange, address }: ReceiveOverlayProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open && address) {
      QRCode.toDataURL(address, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      })
        .then((url) => {
          setQrCodeDataUrl(url)
        })
        .catch((err) => {
          console.error("Error generating QR code:", err)
        })
    }
  }, [open, address])

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error("Failed to copy address:", err)
    }
  }

  const viewOnExplorer = () => {
    // Open in Etherscan (can be made chain-aware later)
    window.open(`https://etherscan.io/address/${address}`, "_blank", "noopener,noreferrer")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Receive</DialogTitle>
          <DialogDescription>Share your wallet address to receive funds</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* QR Code */}
          <div className="flex justify-center">
            {qrCodeDataUrl ? (
              <div className="p-4 rounded-base border-2 border-border bg-white">
                <img src={qrCodeDataUrl} alt="Wallet QR Code" className="w-64 h-64" />
              </div>
            ) : (
              <div className="w-64 h-64 rounded-base border-2 border-border bg-foreground/10 animate-pulse flex items-center justify-center">
                <p className="text-foreground/50">Generating QR code...</p>
              </div>
            )}
          </div>

          {/* Wallet Address */}
          <div className="space-y-3">
            <p className="text-sm font-heading text-foreground/50 text-center">Wallet Address</p>
            <div className="p-3 rounded-base border border-border bg-secondary-background">
              <p className="text-sm font-mono text-foreground/70 break-all text-center">
                {address}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="default" size="sm" onClick={copyAddress} className="flex-1 gap-2">
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Address</span>
                </>
              )}
            </Button>
            <Button variant="neutral" size="sm" onClick={viewOnExplorer} className="flex-1 gap-2">
              <ExternalLink className="h-4 w-4" />
              <span>Explorer</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
