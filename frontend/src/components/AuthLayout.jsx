export default function AuthLayout({ children }) {
  return (
    <main className="auth">
      <section className="brand">
        <h1>Bluetail</h1>
        <p>Keep every task in one place and know what is due next.</p>
      </section>
      <section className="panel">{children}</section>
    </main>
  );
}
