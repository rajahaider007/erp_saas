import App from '../App.jsx'
import FormThemeSystem from './FormThemeSystem';
export default function Dashboard() {
  return (
   <App>
      <div className="space-y-6">
        <div className="form-container rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-600 mb-6">Welcome to your ERP Enterprise dashboard with form themes!</p>
        </div>
        
        {/* Embedded Form Theme System */}
        <div className="form-container rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Form Theme System</h2>
          <FormThemeSystem />
        </div>
      </div>
    </App>
  )
}