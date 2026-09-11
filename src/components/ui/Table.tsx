import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-boundary bg-white">
      <table
        className={twMerge(clsx("w-full text-left border-collapse text-sm", className))}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <thead
      className={twMerge(clsx("bg-slate-50 border-b border-boundary text-xs uppercase text-slate-600 font-semibold tracking-wider", className))}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <tbody
      className={twMerge(clsx("divide-y divide-boundary text-slate-800", className))}
      {...props}
    >
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <tr
      className={twMerge(clsx("hover:bg-slate-50/80 transition-colors", className))}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <th
      className={twMerge(clsx("px-4 py-3 text-left font-semibold text-slate-600", className))}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <td
      className={twMerge(clsx("px-4 py-3 align-middle text-sm", className))}
      {...props}
    >
      {children}
    </td>
  );
};
