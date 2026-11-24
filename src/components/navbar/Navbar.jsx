import { useEffect, useId, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { supabase } from '../../supabaseClient';
import styles from './Navbar.module.css';
import logo from '../../assets/logo.png';

const MENUS = [
  {
    id: 'gestao',
    label: 'Gestão',
    items: [
      ['/usuarios', 'Usuários (Equipe)'],
      ['/clientes', 'Clientes (Alunos/Visitantes)'],
    ],
  },
  {
    id: 'patrimonio',
    label: 'Patrimônio',
    items: [
      ['/cadastros/maquinas', 'Máquinas (3D / Scanners)'],
      ['/cadastros/emprestimos', 'Equipamentos para empréstimo'],
      ['/cadastros/insumos', 'Suprimentos e insumos'],
    ],
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    items: [
      ['/relatorios/consumo-de-filamentos', 'Consumo de filamentos'],
      ['/relatorios/uso-das-maquinas', 'Uso das máquinas'],
      ['/relatorios/historico-de-emprestimos', 'Histórico de empréstimos'],
      ['/relatorios/historico-de-manutencoes', 'Histórico de manutenções'],
      ['/relatorios/historico-de-producao', 'Histórico de produção'],
    ],
  },
];

function Dropdown({ label, open, active, account, onEnter, onLeave, onToggle, onClose, children }) {
  const panelId = useId();
  const button = useRef(null);
  const panel = useRef(null);

  return (
    <div className={styles.dropdown}
      onPointerEnter={event => { if (event.pointerType === 'mouse') onEnter(); }}
      onPointerLeave={event => {
        if (event.pointerType === 'mouse' && !panel.current?.contains(document.activeElement)) onLeave();
      }}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) onClose();
      }}
      onKeyDown={event => {
        if (event.key !== 'Escape' || !open) return;
        event.stopPropagation();
        button.current?.focus();
        onClose();
      }}>
      <button ref={button} type="button"
        className={`${styles.navButton} ${account ? styles.accountButton : ''}`}
        data-active={active || undefined} aria-expanded={open} aria-controls={panelId}
        onClick={onToggle}>
        <span className={styles.buttonLabel}>{label}</span>
        <span className={styles.chevron} aria-hidden="true">▾</span>
      </button>
      <div ref={panel} id={panelId} className={styles.panel} data-open={open}
        aria-hidden={!open}>
        <div className={styles.panelContent}>{children}</div>
      </div>
    </div>
  );
}

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const nav = useRef(null);
  const [menu, setMenu] = useState(null);
  const [userName, setUserName] = useState('Usuário');
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user;
      if (user && !cancelled) {
        setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário');
      }
    }, () => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function closeOutside(event) {
      if (!nav.current?.contains(event.target)) setMenu(null);
    }

    function closeHoverWithEscape(event) {
      if (event.key === 'Escape') {
        setMenu(current => current?.mode === 'hover' ? null : current);
      }
    }

    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeHoverWithEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeHoverWithEscape);
    };
  }, []);

  async function handleLogout() {
    if (signingOut) return;
    setSigningOut(true);
    setLogoutError('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setMenu(null);
      navigate('/');
    } catch {
      setLogoutError('Não foi possível sair. Tente novamente.');
    } finally {
      setSigningOut(false);
    }
  }

  function dropdownProps(id) {
    const open = menu?.id === id && menu.locationKey === location.key;
    const close = () => setMenu(current => current?.id === id ? null : current);
    return {
      open,
      onClose: close,
      onEnter: () => setMenu(current => {
        if (current?.locationKey === location.key && current.mode === 'click') return current;
        if (nav.current?.querySelector('[data-open="true"]')?.contains(document.activeElement)) return current;
        return { id, mode: 'hover', locationKey: location.key };
      }),
      onLeave: () => setMenu(current => current?.id === id && current.mode === 'hover' ? null : current),
      onToggle: () => setMenu(open && menu.mode === 'click'
        ? null
        : { id, mode: 'click', locationKey: location.key }),
    };
  }

  const account = dropdownProps('conta');

  return (
    <nav ref={nav} className={styles.nav} aria-label="Navegação principal">
      <NavLink to="/" end className={styles.logo} onClick={() => setMenu(null)}>
        <img src={logo} alt="Museu UNICAP, início" className={styles.logoImage} />
      </NavLink>

      <div className={styles.links}>
        <NavLink to="/" end className={styles.navButton} onClick={() => setMenu(null)}>Início</NavLink>

        {MENUS.map(({ id, label, items }) => {
          const dropdown = dropdownProps(id);
          const active = items.some(([to]) => to === location.pathname);
          return (
            <Dropdown key={id} label={label} active={active} {...dropdown}>
              {items.map(([to, text]) => (
                <NavLink key={to} to={to} end className={styles.dropdownItem}
                  tabIndex={dropdown.open ? undefined : -1} onClick={dropdown.onClose}>
                  {text}
                </NavLink>
              ))}
            </Dropdown>
          );
        })}

        <Dropdown label={userName} account active={location.pathname === '/preferencias'} {...account}>
          <NavLink to="/preferencias" end className={styles.dropdownItem}
            tabIndex={account.open ? undefined : -1} onClick={account.onClose}>Preferências</NavLink>
          <button type="button" className={`${styles.dropdownItem} ${styles.logoutItem}`}
            tabIndex={account.open ? undefined : -1} disabled={signingOut} onClick={handleLogout}>
            {signingOut ? 'Saindo…' : 'Sair'}
          </button>
        </Dropdown>
      </div>

      {logoutError && <p role="alert" className={styles.error}>{logoutError}</p>}
    </nav>
  );
}