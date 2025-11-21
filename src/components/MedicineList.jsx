import React from "react";

export default function MedicineList({ items, mode = "user", onEdit, onDelete, onToggleAvailable, onOrder }) {
  if (!items.length) return <div className="muted">No products</div>;
  return (
    <div className="grid">
      {items.map((m) => (
        <div className="card" key={m._id}>
          {m.imageUrl ? (
            <img src={m.imageUrl} alt={m.name} style={{ width: "100%", height: 160, objectFit: "cover", borderTopLeftRadius: 16, borderTopRightRadius: 16, display: "block" }} />
          ) : null}
          <div className="card-body">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="title">{m.name}</div>
              <span className="pill">{m.available ? "Available" : "Not Available"}</span>
            </div>
            <div className="muted" style={{ margin: "8px 0" }}>{m.benefits}</div>
            <div className="price">₹ {Number(m.price).toFixed(2)}</div>
            {mode === "admin" ? (
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn-outline btn" onClick={() => onToggleAvailable && onToggleAvailable(m)}>{m.available ? "Mark Not Available" : "Mark Available"}</button>
                <button className="btn-outline btn" onClick={() => onEdit && onEdit(m)}>Edit</button>
                <button className="btn-outline btn" onClick={() => onDelete && onDelete(m)}>Delete</button>
              </div>
            ) : (
              <div className="row" style={{ marginTop: 10 }}>
                {m.available ? (
                  <button className="btn btn-success" onClick={() => onOrder && onOrder(m)}>Order Now</button>
                ) : (
                  <span className="muted">Not available</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}