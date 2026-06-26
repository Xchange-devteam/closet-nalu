import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SacolaProvider } from './lib/sacola'
import { FavoritosProvider } from './lib/favoritos'
import Home from './pages/Home'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminProdutos from './pages/AdminProdutos'
import AdminCategorias from './pages/AdminCategorias'
import AdminBanner from './pages/AdminBanner'
import LojaCategorias from './pages/LojaCategorias'
import LojaListagem from './pages/LojaListagem'
import LojaPeca from './pages/LojaPeca'
import LojaDetalhe from './pages/LojaDetalhe'
import LojaSacola from './pages/LojaSacola'
import LojaTodas from './pages/LojaTodas'
import LojaPesquisar from './pages/LojaPesquisar'
import LojaPerfil from './pages/LojaPerfil'
import LojaFavoritos from './pages/LojaFavoritos'
import LojaDados from './pages/LojaDados'
import LojaEntrar from './pages/LojaEntrar'
import LojaCadastrar from './pages/LojaCadastrar'

export default function App() {
  return (
    <SacolaProvider>
    <FavoritosProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categorias" element={<LojaCategorias />} />
        <Route path="/categoria/:slug" element={<LojaListagem />} />
        <Route path="/peca/:id" element={<LojaPeca />} />
        <Route path="/detalhe/:id" element={<LojaDetalhe />} />
        <Route path="/sacola" element={<LojaSacola />} />
        <Route path="/todas" element={<LojaTodas />} />
        <Route path="/pesquisar" element={<LojaPesquisar />} />
        <Route path="/perfil" element={<LojaPerfil />} />
        <Route path="/favoritos" element={<LojaFavoritos />} />
        <Route path="/entrar" element={<LojaEntrar />} />
        <Route path="/cadastrar" element={<LojaCadastrar />} />
        <Route path="/perfil/dados" element={<LojaDados />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/produtos" element={<AdminProdutos />} />
        <Route path="/admin/categorias" element={<AdminCategorias />} />
        <Route path="/admin/banner" element={<AdminBanner />} />
      </Routes>
    </BrowserRouter>
    </FavoritosProvider>
    </SacolaProvider>
  )
}
