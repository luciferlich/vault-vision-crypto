import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AssetData {
  symbol: string;
  quantity: number;
  entryPrice: number;
}

interface AddAssetDialogProps {
  onAddAsset: (asset: AssetData) => void;
}

export const AddAssetDialog = ({ onAddAsset }: AddAssetDialogProps) => {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol || !quantity || !entryPrice) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const assetData: AssetData = {
        symbol: symbol.toUpperCase(),
        quantity: parseFloat(quantity),
        entryPrice: parseFloat(entryPrice),
      };

      onAddAsset(assetData);
      
      // Reset form
      setSymbol("");
      setQuantity("");
      setEntryPrice("");
      setOpen(false);
      
      toast({
        title: "Asset Added",
        description: `Added ${assetData.symbol} to portfolio`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add asset",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary shadow-glow hover:shadow-glow transition-smooth">
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Crypto Asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              placeholder="BTC, ETH, SOL..."
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="bg-input border-border/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.00000001"
              placeholder="0.5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-input border-border/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entryPrice">Entry Price (USD)</Label>
            <Input
              id="entryPrice"
              type="number"
              step="0.01"
              placeholder="45000"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="bg-input border-border/50"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-border/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-primary shadow-glow hover:shadow-glow transition-smooth"
            >
              {loading ? "Adding..." : "Add Asset"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};