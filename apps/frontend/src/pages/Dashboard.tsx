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
import { Trash2Icon } from 'lucide-react';





const Dashboard = () => {
  const [urls, setUrls] = useState<Url[]>([]);
  const handleDelete = async (shortId: string) => {
    try {
      await api.delete(`/urls/${shortId}`);
      setUrls((prev) => prev.filter((url) => url.shortId !== shortId));
    } catch (err) {
      console.error('Failed to delete URL', err);
    }
  };
  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await api.get('/urls/me');
        setUrls(response.data);
      } catch (err) {
        console.error('Failed to fetch URLs', err);
      } 
    };

    fetchUrls();
  }, []);


  return (
    <div className="mx-auto max-w-7xl p-6">
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
              <a
                href={`${window.location.origin}/${url.shortId}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-crimson hover:underline"
              >
                /{url.shortId}
              </a>
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
            <TableCell><Button variant="destructive" onClick={() => handleDelete(url.shortId)}> <Trash2Icon className='h-5' />Delete</Button> </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  );
};

export default Dashboard;
