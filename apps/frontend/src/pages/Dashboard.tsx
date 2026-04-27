import { useEffect, useMemo, useRef, useState } from "react";
import { type Url } from "../types/url";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import {
  Trash2Icon,
  CopyIcon,
  CheckIcon,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/AlertDialog";
import {
  setDashboardSort,
  type SortField,
} from "@/store/slices/preferencesSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import { type FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { type SerializedError } from "@reduxjs/toolkit";
import { useDeleteUrlMutation, useGetMyUrlsQuery } from "@/store/api/urlsApi";
import { removeRecent } from "@/store/slices/recentsSlice";

const Dashboard = () => {
  const { data: urls = [], isLoading, error } = useGetMyUrlsQuery();
  const [deleteUrlMutation, { isLoading: isDeleting }] = useDeleteUrlMutation();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const sort = useAppSelector((s) => s.preferences.dashboardSort);
  const dispatch = useAppDispatch();

  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const filterKey = `${query}|${sort.field}|${sort.direction}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();
  const toast = useToast();

  const getErrorMessage = (
    error: FetchBaseQueryError | SerializedError | undefined,
  ): string => {
    if (!error) return "";

    if ("status" in error) {
      const data = error.data as any;
      return data?.message || data?.error || `API Error: ${error.status}`;
    } else {
      return error.message || "An unexpected error occurred";
    }
  };

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

  const confirmDeleteUrl = urls.find((u) => u.shortId === confirmDeleteId);

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteUrlMutation(confirmDeleteId).unwrap();
      dispatch(removeRecent(confirmDeleteId));
      toast.success("Link deleted");
      setConfirmDeleteId(null);
    } catch (err: any) {
      toast.error(
        "Failed to delete URL",
        err?.data?.error ?? "Please try again.",
      );
      setConfirmDeleteId(null);
    }
  };

  const handleSortClick = (field: SortField) => {
    if (sort.field === field) {
      dispatch(
        setDashboardSort({
          field,
          direction: sort.direction === "asc" ? "desc" : "asc",
        }),
      );
    } else {
      dispatch(setDashboardSort({ field, direction: "asc" }));
    }
  };

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${value}`);
      setCopiedId(value);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(20);
  }

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
          <p className="text-red-500">{getErrorMessage(error)}</p>
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
                    onClick={() => setConfirmDeleteId(url.shortId)}
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

      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete this link?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <code className="font-mono text-crimson">/{confirmDeleteId}</code>
            {confirmDeleteUrl ? (
              <>
                {" "}
                pointing to{" "}
                <span className="break-all text-ink">
                  {confirmDeleteUrl.originalUrl}
                </span>
                .
              </>
            ) : (
              "."
            )}{" "}
            This action cannot be undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmDeleteId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              loading={isDeleting}
            >
              Yes, delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
