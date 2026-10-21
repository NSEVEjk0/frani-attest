"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Wallet as WalletIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AttestWordmark } from "@/components/logo";
import { PrivateKeyDialog } from "@/components/private-key-dialog";
import { connectWallet, copyPrivateKey, currentWallet, disconnectWallet, restoreWallet, type Wallet } from "@/lib/attest";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/verify", label: "Verify" },
];

export function Header() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
  const [mode, setMode] = useState<"choose" | "create" | "import" | "mnemonic">("choose");
  const [mnemonic, setMnemonic] = useState("");
  const [busy, setBusy] = useState(false);
  const [freshMnemonic, setFreshMnemonic] = useState("");
  const [keyOpen, setKeyOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const cached = currentWallet();
    if (cached) {
      setWallet(cached);
      if (cached.kind === "unicity") {
        const restored = restoreWallet();
        if (restored) setWallet(restored);
      }
    }
  }, []);

  function handleConnect(mnemonicInput?: string) {
    setBusy(true);
    try {
      const w = connectWallet(mnemonicInput ? { mnemonic: mnemonicInput } : undefined);
      setWallet(w);
      setMnemonic("");
      if (w.generatedMnemonic) {
        setFreshMnemonic(w.generatedMnemonic);
        setMode("mnemonic");
      } else {
        setConnectOpen(false);
        setMode("choose");
        toast.success("Wallet connected");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not connect wallet");
    } finally {
      setBusy(false);
    }
  }

  function handleDisconnect() {
    disconnectWallet();
    setWallet(null);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/50 glass">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-foreground">
            <AttestWordmark />
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {wallet ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 rounded-full pl-1.5 pr-3">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/15 text-[10px] font-bold text-primary">
                      {wallet.nametag.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[90px] truncate text-xs font-medium">{wallet.nametag}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  UNICITY WALLET
                </DropdownMenuLabel>
                <div className="px-2 pb-2 font-mono text-[11px] text-muted-foreground break-all">
                  {wallet.address}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setKeyOpen(true)}>Copy private key</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDisconnect}>Disconnect</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" className="h-9 gap-2 rounded-full" onClick={() => setConnectOpen(true)}>
              <WalletIcon className="h-4 w-4" />
              Connect wallet
            </Button>
          )}
        </div>
      </header>

      <Dialog open={connectOpen} onOpenChange={(o) => { if (!o) { setConnectOpen(false); setMode("choose"); setMnemonic(""); } }}>
        <DialogContent className="max-w-md">
          {mode === "choose" ? (
            <>
              <DialogHeader>
                <DialogTitle>Connect a wallet</DialogTitle>
                <DialogDescription>
                  Your Unicity wallet is your identity on Attest. Create one here or import an existing one.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 pt-1">
                <Button className="w-full justify-start" onClick={() => setMode("create")} disabled={busy}>
                  <WalletIcon className="h-4 w-4" />
                  Create a new Unicity wallet
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setMode("import")} disabled={busy}>
                  Import an existing mnemonic
                </Button>
              </div>
            </>
          ) : mode === "create" ? (
            <>
              <DialogHeader>
                <DialogTitle>Create a wallet</DialogTitle>
                <DialogDescription>
                  We&apos;ll generate a fresh 12-word mnemonic. You&apos;ll see it once — save it somewhere safe.
                </DialogDescription>
              </DialogHeader>
              <Button className="w-full" onClick={() => handleConnect()} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {busy ? "Creating wallet…" : "Generate wallet"}
              </Button>
            </>
          ) : mode === "import" ? (
            <>
              <DialogHeader>
                <DialogTitle>Import wallet</DialogTitle>
                <DialogDescription>Enter your 12 or 24-word mnemonic.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="mnemonic">Mnemonic</Label>
                  <Input
                    id="mnemonic"
                    placeholder="word word word …"
                    value={mnemonic}
                    onChange={(e) => setMnemonic(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                <Button className="w-full" onClick={() => handleConnect(mnemonic)} disabled={busy || !mnemonic.trim()}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {busy ? "Importing…" : "Import wallet"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Save your recovery phrase</DialogTitle>
                <DialogDescription>
                  This is the only time it&apos;s shown. Write it down — anyone with these words controls this wallet.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-xl border bg-background/60 p-4">
                <p className="font-mono text-sm leading-relaxed break-words">{freshMnemonic}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => { setConnectOpen(false); setMode("choose"); setFreshMnemonic(""); }}>
                  I saved it
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <PrivateKeyDialog open={keyOpen} onOpenChange={setKeyOpen} onReveal={copyPrivateKey} />
    </>
  );
}
