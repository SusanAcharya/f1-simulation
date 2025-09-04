export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="page container">
      <h1>{title}</h1>
      <div className="card" style={{ marginTop: 16 }}>
        <p className="muted">This page is under construction.</p>
      </div>
    </div>
  )
}


