import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import CsvUploadModal from "../components/CsvUploadModal";
import { toast } from "../components/Toast";

function Library() {
    const [books, setBooks] = useState([]);
    const [bookName, setBookName] = useState("");
    const [author, setAuthor] = useState("");
    const [isbn, setIsbn] = useState("");
    const [quantity, setQuantity] = useState("");
    const [search, setSearch] = useState("");
    const [csvModalOpen, setCsvModalOpen] = useState(false);

    useEffect(() => { fetchBooks(); }, []);

    const fetchBooks = async () => {
        try { const r = await api.get("/books"); setBooks(r.data); }
        catch { toast.error("Unable to load books"); }
    };

    const addBook = async (e) => {
        e.preventDefault();
        try {
            await api.post("/books", { bookName, author, isbn, quantity });
            toast.success("Book added successfully");
            setBookName(""); setAuthor(""); setIsbn(""); setQuantity("");
            fetchBooks();
        } catch {
            toast.error("Unable to add book");
        }
    };

    const filtered = books.filter(b =>
        b.bookName?.toLowerCase().includes(search.toLowerCase()) ||
        b.author?.toLowerCase().includes(search.toLowerCase()) ||
        b.isbn?.toLowerCase().includes(search.toLowerCase())
    );

    const generateAutoIsbn = () => {
        const prefix = "978-3-16-1484";
        const suffix = Math.floor(100 + Math.random() * 900);
        setIsbn(`${prefix}${suffix}`);
        toast.info(`Auto-generated ISBN: ${prefix}${suffix}`);
    };

    const autoPopulateCatalog = async () => {
        const samples = [
            { bookName: "Introduction to Algorithms (4th Ed)", author: "Cormen, Leiserson", isbn: "978-0262046305", quantity: 15 },
            { bookName: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", quantity: 10 },
            { bookName: "Artificial Intelligence: A Modern Approach", author: "Russell & Norvig", isbn: "978-0134610993", quantity: 8 }
        ];

        if (!window.confirm("Auto-populate library catalog with sample computer science reference books?")) return;

        try {
            for (const b of samples) {
                await api.post("/books", b);
            }
            toast.success("Added 3 reference books to library catalog!");
            fetchBooks();
        } catch {
            toast.error("Error populating library catalog");
        }
    };

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Library</h1>
                        <p className="page-subtitle">{books.length} books in catalogue</p>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn btn-secondary" onClick={autoPopulateCatalog}>⚡ Populate Sample Books</button>
                        <button className="btn btn-secondary" onClick={() => setCsvModalOpen(true)}>⬆️ Import CSV</button>
                    </div>
                </div>

                {/* Add Book Form */}
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-header">
                        <span className="card-title">📚 Add New Book</span>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={generateAutoIsbn}>⚡ Generate ISBN</button>
                    </div>
                    <form onSubmit={addBook} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, alignItems: "end" }}>
                        <div className="form-group">
                            <label className="form-label">Book Name</label>
                            <input className="form-input" placeholder="Enter book title" value={bookName} onChange={e => setBookName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Author</label>
                            <input className="form-input" placeholder="Author name" value={author} onChange={e => setAuthor(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <label className="form-label">ISBN</label>
                                <button type="button" onClick={generateAutoIsbn} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600 }}>⚡ Auto</button>
                            </div>
                            <input className="form-input" placeholder="ISBN number" value={isbn} onChange={e => setIsbn(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Quantity</label>
                            <input className="form-input" type="number" min="1" placeholder="1" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ height: 42 }}>Add Book</button>
                    </form>
                </div>

                {/* Search */}
                <div className="search-bar">
                    <div className="search-input-wrap">
                        <span>🔍</span>
                        <input placeholder="Search by title, author or ISBN..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                {/* Table */}
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Book Name</th>
                                <th>Author</th>
                                <th>ISBN</th>
                                <th style={{ textAlign: "right" }}>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((book, i) => (
                                <tr key={book.id}>
                                    <td style={{ color: "var(--text-muted)", width: 40 }}>{i + 1}</td>
                                    <td style={{ fontWeight: 600 }}>{book.bookName}</td>
                                    <td style={{ color: "var(--text-muted)" }}>{book.author}</td>
                                    <td><code style={{ fontSize: "0.8rem", background: "var(--surface-2)", color: "var(--text)", padding: "2px 7px", borderRadius: 5 }}>{book.isbn}</code></td>
                                    <td style={{ textAlign: "right" }}>
                                        <span className={`badge ${book.quantity > 0 ? "badge-green" : "badge-red"}`}>{book.quantity} copies</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5"><div className="empty-state"><div className="empty-state-icon">📚</div><div className="empty-state-title">No books found</div></div></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <CsvUploadModal
                    isOpen={csvModalOpen}
                    onClose={(ok) => { setCsvModalOpen(false); if (ok) { fetchBooks(); toast.success("Books imported!"); } }}
                    uploadUrl="http://localhost:5000/api/books/import"
                    title="Import Books via CSV"
                    sampleData="bookName,author,isbn,quantity"
                />
            </div>
        </div>
    );
}

export default Library;