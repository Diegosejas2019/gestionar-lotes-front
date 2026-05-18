import React from 'react';
import { Link } from 'react-router-dom';

const WHATSAPP_URL = 'https://wa.me/5491100000000?text=Hola%2C%20quiero%20conocer%20GestionAr%20Lotes';

const modules = [
  { title: 'Comercial', desc: 'Leads, cotizaciones y reservas. Control del proceso de venta desde el primer contacto.' },
  { title: 'Financiero', desc: 'Cuotas, pagos, caja, gastos y obras. Trazabilidad completa del dinero.' },
  { title: 'Documental', desc: 'Generación de contratos, recibos y certificados en PDF firmados.' },
  { title: 'Portal comprador', desc: 'Acceso online para que el comprador consulte su cuenta y estado de cuotas.' },
  { title: 'Legal / Escrituración', desc: 'Mora, refinanciación, procesos legales y escrituración integrada.' },
  { title: 'Reportes', desc: 'Dashboards y reportes comerciales, financieros, legales y ejecutivos.' },
  { title: 'Migración', desc: 'Cuando el barrio está listo, migrá compradores y lotes a GestionAr App.' },
];

const plans = [
  { name: 'Inicial', price: 'Consultar', features: ['1 barrio', '200 lotes', '50 compradores', 'Ventas y cuotas', 'Documentos PDF'] },
  { name: 'Pro', price: 'Consultar', highlight: true, features: ['5 barrios', '2.000 lotes', 'Compradores ilimitados', 'Portal comprador', 'Caja y finanzas', 'Reportes y exports'] },
  { name: 'Empresa', price: 'A medida', features: ['Sin límites', 'Todos los módulos', 'Escrituración', 'Migración GestionAr App', 'Soporte prioritario'] },
];

export function LandingPage(): React.ReactElement {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#1f2937', lineHeight: 1.6 }}>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#2563eb' }}>GestionAr Lotes</div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="#modulos" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.9rem' }}>Módulos</a>
          <a href="#planes" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.9rem' }}>Planes</a>
          <Link to="/legal/terms" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.9rem' }}>Legales</Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" style={{ padding: '0.4rem 1rem', background: '#2563eb', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Solicitar demo</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', color: '#fff', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
            Vender, financiar y administrar lotes — todo en un solo lugar
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem' }}>
            GestionAr Lotes es la plataforma para desarrolladores inmobiliarios que quieren controlar cada etapa: desde la reserva hasta la escrituración.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" style={{ padding: '0.75rem 2rem', background: '#fff', color: '#2563eb', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '1rem' }}>
              Solicitar demo
            </a>
            <Link to="/dashboard" style={{ padding: '0.75rem 2rem', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '1rem', border: '1px solid rgba(255,255,255,0.4)' }}>
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Problema */}
      <section style={{ padding: '4rem 2rem', background: '#f9fafb' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>¿Reconocés alguno de estos problemas?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              'Excel desordenado con compradores y cuotas mezcladas',
              'No sabés qué lotes están reservados, vendidos o disponibles',
              'Reservas vencidas que nadie controla',
              'Pagos recibidos sin trazabilidad ni comprobantes',
              'Documentación dispersa en carpetas y correos',
              'Mora sin seguimiento ni acciones sistemáticas',
            ].map((item) => (
              <div key={item} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', fontSize: '0.9rem', borderLeft: '3px solid #ef4444' }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solución */}
      <section style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>Todo lo que necesitás, en una plataforma</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            Desde la preventa hasta la escrituración, GestionAr Lotes centraliza cada proceso operativo del desarrollador inmobiliario.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {['Preventa', 'Cotizaciones', 'Reservas', 'Ventas', 'Cuotas', 'Documentos', 'Portal comprador', 'Caja', 'Escrituración', 'Migración a GestionAr App'].map((f) => (
              <span key={f} style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.4rem 0.75rem', borderRadius: 20, fontSize: '0.85rem', fontWeight: 500 }}>{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Diferencial */}
      <section style={{ padding: '3rem 2rem', background: '#eff6ff' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Cuando el barrio está listo, migrás sin fricción</h2>
          <p style={{ color: '#374151' }}>
            GestionAr Lotes se integra con <strong>GestionAr App</strong>: cuando termina la etapa comercial de tu barrio, migrás compradores y lotes a la plataforma de administración de consorcios y propiedades horizontales, sin reingresarlo todo desde cero.
          </p>
        </div>
      </section>

      {/* Módulos */}
      <section id="modulos" style={{ padding: '4rem 2rem', background: '#f9fafb' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>Módulos incluidos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {modules.map(({ title, desc }) => (
              <div key={title} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.25rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#1d4ed8' }}>{title}</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section id="planes" style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>Planes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {plans.map(({ name, price, highlight, features }) => (
              <div key={name} style={{
                background: highlight ? '#2563eb' : '#fff',
                color: highlight ? '#fff' : '#1f2937',
                border: highlight ? 'none' : '1px solid #e5e7eb',
                borderRadius: 10,
                padding: '2rem 1.5rem',
                textAlign: 'center',
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', fontWeight: 700 }}>{name}</h3>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: highlight ? '#bfdbfe' : '#2563eb' }}>{price}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', textAlign: 'left' }}>
                  {features.map((f) => (
                    <li key={f} style={{ padding: '0.25rem 0', fontSize: '0.9rem', display: 'flex', gap: 8 }}>
                      <span style={{ color: highlight ? '#bfdbfe' : '#16a34a' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" style={{
                  display: 'block',
                  padding: '0.6rem',
                  background: highlight ? '#fff' : '#2563eb',
                  color: highlight ? '#2563eb' : '#fff',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}>
                  Consultar
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ padding: '4rem 2rem', background: '#1e40af', color: '#fff', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>¿Listo para ordenar tu operación?</h2>
        <p style={{ opacity: 0.9, marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
          Pedí una demo sin compromiso. Te mostramos cómo funciona en tu contexto.
        </p>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" style={{ padding: '0.85rem 2.5rem', background: '#25d366', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem' }}>
          Contactar por WhatsApp
        </a>
      </section>

      <footer style={{ background: '#111827', color: '#9ca3af', padding: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>
        <div>GestionAr Lotes — Plataforma para desarrolladores inmobiliarios</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          <Link to="/legal/terms" style={{ color: '#d1d5db' }}>Términos</Link>
          <Link to="/legal/privacy" style={{ color: '#d1d5db' }}>Privacidad</Link>
          <Link to="/legal/cookies" style={{ color: '#d1d5db' }}>Cookies</Link>
        </div>
      </footer>
    </div>
  );
}
