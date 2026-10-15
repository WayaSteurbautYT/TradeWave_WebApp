import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { MockStore } from "@/data/mockStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ShoppingBag, ArrowRight, Star, Coins } from "lucide-react"

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)

  const allServices = MockStore.getServices()
  const allContent = MockStore.getContent()

  const matchedServices = allServices.filter(s =>
    !query || s.title.toLowerCase().includes(query.toLowerCase()) || s.description.toLowerCase().includes(query.toLowerCase()) || s.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  )

  const matchedContent = allContent.filter(c =>
    !query || c.title.toLowerCase().includes(query.toLowerCase()) || c.description.toLowerCase().includes(query.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams({ q: query })
  }

  return (
    <div className="container py-8 md:py-12 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Search Results for "{query || "All"}"
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Found {matchedServices.length} services and {matchedContent.length} digital assets.
        </p>
      </div>

      <form onSubmit={handleSearch} className="max-w-xl relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keywords, tags, or engine..."
          className="pl-9 h-10"
        />
      </form>

      {/* Services Results */}
      {matchedServices.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Services &amp; Gigs ({matchedServices.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {matchedServices.map((s) => (
              <Card key={s.id} className="gaming-card border-border bg-card p-5">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-xs capitalize font-semibold text-primary">
                    {s.category}
                  </Badge>
                  <span className="font-black text-sm text-primary">{s.packages.basic.price} credits</span>
                </div>
                <h3 className="font-bold text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                <div className="pt-3 border-t mt-3 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">By {s.creator_name}</span>
                  <Link to="/marketplace">
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-primary">
                      View Service →
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Digital Products Results */}
      {matchedContent.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Digital Products &amp; Assets ({matchedContent.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {matchedContent.map((c) => (
              <Card key={c.id} className="gaming-card border-border bg-card p-5">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="text-xs uppercase font-semibold">
                    {c.content_type}
                  </Badge>
                  <span className="font-black text-sm text-primary">{c.price} credits</span>
                </div>
                <h3 className="font-bold text-sm mb-1">{c.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                <div className="pt-3 border-t mt-3 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Tutorial included</span>
                  <Link to="/marketplace">
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-primary">
                      Download Asset →
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
