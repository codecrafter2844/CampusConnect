function StatCards({ items }) {
  return (
    <div className="st-stats">
      {items.map((item) => (
        <div key={item.label} className={`st-stat ${item.tone || ""}`}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.hint && <small>{item.hint}</small>}
        </div>
      ))}
    </div>
  );
}

export default StatCards;
