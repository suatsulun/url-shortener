import { useEffect, useState } from 'react';
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
import { Trash2Icon, CopyIcon, CheckIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom';





const Dashboard = () => {
  const [urls, setUrls] = useState<Url[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const handleDelete = async (shortId: string) => {
    try {
      await api.delete(`/urls/${shortId}`);
      setUrls((prev) => prev.filter((url) => url.shortId !== shortId));
    } catch (err) {
      console.error('Failed to delete URL', err);
    }
  };

  const copy = async ( value: string ) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${value}`);
      setCopiedId(value);
    } catch (err) {
      console.error("Failed to copy URL", err);
    }
  };

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/urls/me');
        setUrls(response.data);
      } catch (err) {
        console.error('Failed to fetch URLs', err);
        setError('Failed to fetch URLs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrls();
  }, []);


  return (
    <div className="mx-auto max-w-7xl p-6">
    {isLoading ? (
      <div className="flex flex-col items-center gap-4 py-16 text-muted"><p>Loading...</p>
    </div>) : error ? (
      <div className="flex flex-col items-center gap-4 py-16 text-muted"><p className="text-red-500">{error}</p></div>
    ) : urls.length === 0 ? (<div className="flex flex-col items-center gap-4 py-16 text-muted">
      <p>No URLs found!</p>
      <Button size="lg" onClick={() => navigate('/shorten')}>Create your first Short URL</Button></div>
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Short URL</TableHead>
            <TableHead>Original URL</TableHead>
            <TableHead>Clicks</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Expires At</TableHead>
            <TableHead>Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {urls.map((url) => (
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
                    onClick={() =>
                      copy(`${url.shortId}`)
                    }
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
                  className="block max-w-xs truncate text-ink hover:text-crimson hover:underline"
                >
                  {url.originalUrl}
                </a>
              </TableCell>
              <TableCell>{url.clicks}</TableCell>
              <TableCell>{new Date(url.createdAt).toLocaleString()}</TableCell>
              <TableCell>{new Date(url.expiresAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(url.shortId)}
                >
                  {" "}
                  <Trash2Icon className="h-5" />
                  Delete
                </Button>{" "}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>)}
    </div>
  );
};

export default Dashboard;
