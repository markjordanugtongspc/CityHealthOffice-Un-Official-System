"""
Excel → SQL Converter GUI with Pagination
- Reads Excel with pandas/openpyxl
- Preview shows 20 rows per page with headers
- Next/Previous buttons for navigation
- Converts to SQL commands (CREATE TABLE + INSERT) when requested
- Dark, modern GUI with left controls and right output
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import pandas as pd

# Optional: modern dark theme
try:
    import ttkbootstrap as tb
    USE_BOOTSTRAP = True
except ImportError:
    USE_BOOTSTRAP = False


class ExcelToSQLApp:
    def __init__(self, root):
        if USE_BOOTSTRAP:
            self.style = tb.Style(theme="darkly")
            self.root = self.style.master
        else:
            self.root = root
            self.root.configure(bg="#0b1220")

        self.root.title("Excel → SQL Converter")

        # Maximize window (Windows friendly)
        try:
            self.root.state("zoomed")
        except Exception:
            w = self.root.winfo_screenwidth()
            h = self.root.winfo_screenheight()
            self.root.geometry(f"{w-40}x{h-80}+20+20")

        # Layout frames
        self.left_frame = ttk.Frame(self.root, width=300)
        self.right_frame = ttk.Frame(self.root)

        self.left_frame.grid(row=0, column=0, sticky="ns")
        self.right_frame.grid(row=0, column=1, sticky="nsew")

        self.root.grid_columnconfigure(1, weight=1)
        self.root.grid_rowconfigure(0, weight=1)
        self.right_frame.grid_rowconfigure(1, weight=1)
        self.right_frame.grid_columnconfigure(0, weight=1)

        # State
        self.excel_path = tk.StringVar(value="")
        self.table_name = tk.StringVar(value="imported_table")
        self.status_text = tk.StringVar(value="Ready")
        self.df = None
        self.current_page = 0
        self.rows_per_page = 20

        # Build UI
        self._build_left()
        self._build_right()

    # ---------------------------
    # UI Builders
    # ---------------------------
    def _build_left(self):
        pad = 12
        ttk.Label(self.left_frame, text="Controls", font=("Segoe UI", 14, "bold")).pack(padx=pad, pady=(pad,6), anchor="w")

        # File chooser
        ttk.Label(self.left_frame, text="Excel File:").pack(anchor="w", padx=pad)
        ttk.Entry(self.left_frame, textvariable=self.excel_path).pack(fill="x", padx=pad, pady=6)
        ttk.Button(self.left_frame, text="Browse", command=self.browse_file).pack(fill="x", padx=pad, pady=4)

        # Table name
        ttk.Label(self.left_frame, text="Table Name:").pack(anchor="w", padx=pad)
        ttk.Entry(self.left_frame, textvariable=self.table_name).pack(fill="x", padx=pad, pady=6)

        # Buttons
        ttk.Button(self.left_frame, text="Convert → SQL", command=self.convert_to_sql).pack(fill="x", padx=pad, pady=10)
        ttk.Button(self.left_frame, text="Clear Output", command=self.clear_output).pack(fill="x", padx=pad, pady=4)

        # Status
        ttk.Label(self.left_frame, text="Status:", font=("Segoe UI", 10, "bold")).pack(anchor="w", padx=pad, pady=(20,0))
        ttk.Label(self.left_frame, textvariable=self.status_text, wraplength=280).pack(anchor="w", padx=pad, pady=6)

    def _build_right(self):
        ttk.Label(self.right_frame, text="Preview / SQL Output (click to copy)", font=("Segoe UI", 12, "bold")).grid(row=0, column=0, sticky="w", padx=12, pady=(12,6))

        self.output_text = tk.Text(self.right_frame, wrap="none", bg="#0f1720", fg="#e6eef6",
                                   insertbackground="#e6eef6", font=("Consolas", 11), padx=10, pady=10)
        self.output_text.grid(row=1, column=0, sticky="nsew", padx=12, pady=(0,12))
        self.output_text.bind("<Button-1>", self._copy_on_click)

        v_scroll = ttk.Scrollbar(self.right_frame, orient="vertical", command=self.output_text.yview)
        self.output_text.configure(yscrollcommand=v_scroll.set)
        v_scroll.grid(row=1, column=1, sticky="ns", pady=(0,12))

        # Pagination controls
        nav_frame = ttk.Frame(self.right_frame)
        nav_frame.grid(row=2, column=0, sticky="ew", padx=12, pady=(0,12))
        ttk.Button(nav_frame, text="Previous", command=self.prev_page).pack(side="left", padx=6)
        ttk.Button(nav_frame, text="Next", command=self.next_page).pack(side="left", padx=6)

    # ---------------------------
    # Actions
    # ---------------------------
    def browse_file(self):
        path = filedialog.askopenfilename(title="Select Excel file", filetypes=[("Excel files", "*.xlsx *.xlsm *.xls")])
        if path:
            self.excel_path.set(path)
            self.load_excel(path)

    def load_excel(self, path):
        try:
            self._set_status("Loading Excel...")
            df = pd.read_excel(path, engine="openpyxl")
            self.df = df
            self.current_page = 0  # reset to first page
            self._set_status(f"Loaded {len(df)} rows, {len(df.columns)} columns.")
            self._show_preview()
        except Exception as e:
            self._set_status(f"Error: {e}")
            messagebox.showerror("Load Error", f"Failed to load Excel:\n{e}")

    def convert_to_sql(self):
        if self.df is None:
            messagebox.showinfo("No data", "Load an Excel file first.")
            return
        try:
            table = self.table_name.get().strip() or "imported_table"
            cols = list(self.df.columns)

            # CREATE TABLE
            create_stmt = f"CREATE TABLE IF NOT EXISTS `{table}` (\n"
            for c in cols:
                create_stmt += f"  `{c}` TEXT,\n"
            create_stmt = create_stmt.rstrip(",\n") + "\n);\n\n"

            # INSERTS
            inserts = ""
            for _, row in self.df.iterrows():
                vals = []
                for c in cols:
                    v = row[c]
                    if pd.isna(v):
                        vals.append("NULL")
                    else:
                        s = str(v).replace("'", "''")
                        vals.append(f"'{s}'")
                inserts += f"INSERT INTO `{table}` ({', '.join('`'+c+'`' for c in cols)}) VALUES ({', '.join(vals)});\n"

            sql_output = create_stmt + inserts
            self.output_text.delete("1.0", tk.END)
            self.output_text.insert(tk.END, sql_output)
            self._set_status("SQL commands generated (click output to copy)")
        except Exception as e:
            self._set_status(f"Error: {e}")
            messagebox.showerror("Conversion Error", f"Failed to convert:\n{e}")

    def clear_output(self):
        self.output_text.delete("1.0", tk.END)
        self._set_status("Output cleared")

    # ---------------------------
    # Pagination Helpers
    # ---------------------------
    def _show_preview(self):
        if self.df is None:
            return
        start = self.current_page * self.rows_per_page
        end = start + self.rows_per_page
        df_preview = self.df.iloc[start:end]

        self.output_text.delete("1.0", tk.END)
        if df_preview.empty:
            self.output_text.insert(tk.END, "No data to preview.\n")
            return

        s = df_preview.to_string(index=False)
        self.output_text.insert(tk.END, s)
        total_pages = (len(self.df) - 1) // self.rows_per_page + 1
        self._append_output(f"\n\nPage {self.current_page+1} of {total_pages}")

    def next_page(self):
        if self.df is None:
            return
        if (self.current_page+1)*self.rows_per_page < len(self.df):
            self.current_page += 1
            self._show_preview()

    def prev_page(self):
        if self.df is None:
            return
        if self.current_page > 0:
            self.current_page -= 1
            self._show_preview()

    # ---------------------------
    # Helpers
    # ---------------------------
    def _append_output(self, text):
        self.output_text.insert(tk.END, "\n\n" + str(text))
        self.output_text.see(tk.END)

    def _copy_on_click(self, event=None):
        content = self.output_text.get("1.0", tk.END).strip()
        if content:
            self.root.clipboard_clear()
            self.root.clipboard_append(content)
            self._set_status("Output copied to clipboard")

    def _set_status(self, text):
        self.status_text.set(text)


# ---------------------------
# Run
# ---------------------------
def main():
    if USE_BOOTSTRAP:
        app_root = tb.Window(themename="darkly")
    else:
        app_root = tk.Tk()
    app = ExcelToSQLApp(app_root)
    app_root.mainloop()


if __name__ == "__main__":
    main()
