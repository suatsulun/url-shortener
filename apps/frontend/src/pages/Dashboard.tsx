import { useEffect, useMemo, useRef, useState } from 'react';
import { type Url } from '../types/url';
import { api } from '../lib/api';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Button } from '@/components/ui/Button';
import { Trash2Icon, CopyIcon, CheckIcon, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';


const Dashboard = () => {
  const [urls, setUrls] = useState<Url[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ field: "createdAt", direction: "desc" });
  const [visibleCount, setVisibleCount] = useState(20);

  type PendingDelete = { url: Url; index: number; timeoutId: ReturnType<typeof setTimeout> };

  const pendingDeletes = useRef<Map<string, PendingDelete>>(new Map());
  const sentinelRef = useRef<HTMLDivElement | null>(null);


  const navigate = useNavigate();
  const toast = useToast();
  
  const filteredUrls = useMemo(() => {
    const direction = sort.direction === "asc" ? 1 : -1;

    const compareFn = (a: Url, b: Url) => {
      let result = 0;
      if (sort.field === "clicks") {
        result = a.clicks - b.clicks;
      } else if (sort.field === "shortId") {
        result = a.shortId.localeCompare(b.shortId);
      } else if (sort.field === "createdAt") {
        result =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sort.field === "expiresAt") {
        result =
          new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      }
      return result * direction;
    };

    const search = query.toLowerCase();
    const filtered =
      search === ""
        ? urls
        : urls.filter(
            (url) =>
              url.shortId.toLowerCase().includes(search) ||
              url.originalUrl.toLowerCase().includes(search),
          );

    return [...filtered].sort(compareFn);
  }, [urls, query, sort]);

  const visibleUrls = filteredUrls.slice(0, visibleCount);

  const handleDelete = (shortId: string) => {
    const index = urls.findIndex((u) => u.shortId === shortId);
    if (index === -1) return;

    const url = urls[index];
    setUrls((prev) => prev.filter((u) => u.shortId !== shortId));

    const timeoutId = setTimeout( async () => {
      try {
        await api.delete(`/urls/${shortId}`);
      } catch (err: any) {
        toast.error("Failed to delete URL",
           err.response?.data?.error ?? "Please try again.",
        );
        setUrls((prev) => {
          const next = [...prev];
          next.splice(index, 0, url);
          return next;
        });
      } finally {
        pendingDeletes.current.delete(shortId);
      }
    }, 5000);

     pendingDeletes.current.set(shortId, { url, index, timeoutId });
     
      toast.undoable("Link deleted", () => {
        const entry = pendingDeletes.current.get(shortId);
        if (!entry) return;
        clearTimeout(entry.timeoutId);
        pendingDeletes.current.delete(shortId);
        setUrls((prev) => {
          const next = [...prev];
          next.splice(entry.index, 0, entry.url);
          return next;
        });
      });

  };

  const handleSortClick = (field: string) => {
    if (sort.field === field) {
      setSort((prev) => ({
        field,
        direction: prev.direction === "asc" ? "desc" : "asc",
      }));
    } else {
      setSort({ field, direction: "asc" });
    }};

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${value}`);
      setCopiedId(value);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/urls/me');
        setUrls(response.data);
      } catch {
        setError('Failed to fetch URLs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrls();
  }, []);

  useEffect(() => {
    return () => {
      pendingDeletes.current.forEach(({timeoutId, url}) => {
        clearTimeout(timeoutId);
        api.delete(`/urls/${url.shortId}`).catch(() => {});
      });
    };
  }, []);

  useEffect(() => {
    setVisibleCount(20);
  }, [query, sort]);

useEffect(() => {
  const node = sentinelRef.current;
  if (!node) return;
  if (visibleCount >= filteredUrls.length) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setVisibleCount((v) => v + 20);
    }
  });
  observer.observe(node);
  return () => observer.disconnect();
}, [filteredUrls.length, visibleCount]);




  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <Input
        className="mb-5"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search URLs..."
      />
      {isLoading ? (
        <div className="flex flex-col items-center gap-4 py-16 text-muted">
          <p>Loading...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-16 text-muted">
          <p className="text-red-500">{error}</p>
        </div>
      ) : urls.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-muted">
          <p>No URLs found!</p>
          <Button size="lg" onClick={() => navigate("/shorten")}>
            Create your first Short URL
          </Button>
        </div>
      ) : filteredUrls.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-muted">
          <p>
            No matches for <code>{query}</code>
          </p>
          <Button variant="ghost" onClick={() => setQuery("")}>
            Clear search
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Short URL</TableHead>
              <TableHead>Original URL</TableHead>
              <TableHead onClick={() => handleSortClick("clicks")}>
                Clicks{" "}
                {sort.field === "clicks" ? (
                  sort.direction === "asc" ? (
                    <ArrowUp className="inline" />
                  ) : (
                    <ArrowDown className="inline" />
                  )
                ) : (
                  <ArrowUpDown className="inline" />
                )}
              </TableHead>
              <TableHead
                onClick={() => handleSortClick("createdAt")}
                className="hidden md:table-cell"
              >
                Created At
                {sort.field === "createdAt" ? (
                  sort.direction === "asc" ? (
                    <ArrowUp className="inline" />
                  ) : (
                    <ArrowDown className="inline" />
                  )
                ) : (
                  <ArrowUpDown className="inline" />
                )}
              </TableHead>
              <TableHead
                onClick={() => handleSortClick("expiresAt")}
                className="hidden md:table-cell"
              >
                Expires At
                {sort.field === "expiresAt" ? (
                  sort.direction === "asc" ? (
                    <ArrowUp className="inline" />
                  ) : (
                    <ArrowDown className="inline" />
                  )
                ) : (
                  <ArrowUpDown className="inline" />
                )}
              </TableHead>
              <TableHead className="text-center">Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleUrls.map((url) => (
              <TableRow key={url.shortId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <a
                      href={`${window.location.origin}/${url.shortId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-crimson hover:underline"
                    >
                      /{url.shortId}
                    </a>
                    <Button
                      onClick={() => copy(`${url.shortId}`)}
                      variant={copiedId === url.shortId ? "success" : "ghost"}
                      className="h-7 w-7 p-0"
                    >
                      {copiedId === url.shortId ? <CheckIcon /> : <CopyIcon />}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <a
                    href={url.originalUrl}
                    target="_blank"
                    rel="noreferrer"
                    title={url.originalUrl}
                    className="block max-w-[140px] sm:max-w-[220px] md:max-w-xs truncate text-ink hover:text-crimson hover:underline"
                  >
                    {url.originalUrl}
                  </a>
                </TableCell>
                <TableCell className="text-center">{url.clicks}</TableCell>
                <TableCell className="hidden md:table-cell whitespace-nowrap">
                  {new Date(url.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="hidden md:table-cell whitespace-nowrap">
                  {new Date(url.expiresAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(url.shortId)}
                    className="px-2 md:px-4"
                    aria-label="Delete"
                  >
                    <Trash2Icon className="h-5" />
                    <span className="hidden md:inline">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
};

export default Dashboard;
