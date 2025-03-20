import React, { useState } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { FiBarChart2 } from 'react-icons/fi';
import { useSalesByUniverse } from '@/hooks/useSalesByUniverse';

// Palette de couleurs pour les différents univers
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#8DD1E1', '#A4DE6C', '#D0ED57', '#FAAAA3',
  '#F5C3C1', '#B4A7D6', '#D5A6BD', '#C27BA0', '#76A5AF',
  '#9FC5E8', '#B6D7A8', '#FFD966', '#F9CB9C', '#EA9999'
];

// Interface pour les données d'univers formatées pour le treemap
interface TreemapItem {
  name: string;
  size: number;
  value: number;
  margin: number;
  quantity: number;
  revenue_percentage: number;
  margin_percentage: number;
  color: string;
}

// Formater les montants en euros
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Formater les pourcentages
const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};

// Formater les données pour le treemap
const formatDataForTreemap = (data: any[]): TreemapItem[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map((item, index) => ({
    name: item.universe || "Non catégorisé",
    size: parseFloat(item.revenue) || 0,
    value: parseFloat(item.revenue) || 0,
    margin: parseFloat(item.margin) || 0,
    quantity: parseInt(item.quantity) || 0,
    revenue_percentage: parseFloat(item.revenue_percentage) || 0,
    margin_percentage: parseFloat(item.margin_percentage) || 0,
    color: COLORS[index % COLORS.length]
  }));
};

// Fonction pour déterminer la couleur du texte (blanc ou noir) selon la couleur de fond
function getContrastText(bgColor: string): string {
  // Convertir la couleur hex en RGB
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculer la luminosité (formule standard)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retourner blanc ou noir selon la luminosité
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// Interface pour les props du composant de contenu
interface CustomTreemapContentProps {
  root?: any;
  depth?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  name?: string;
  value?: any;
  color?: string;
  payload?: any;
}

// Composant pour afficher le contenu de chaque cellule du TreeMap
const CustomTreemapContent: React.FC<CustomTreemapContentProps> = (props) => {
  const { x, y, width, height, name, value, color, payload } = props;
  
  if (!width || !height || width < 0 || height < 0 || !x || !y) return null;
  
  // Si la cellule est trop petite, n'afficher que le rectangle coloré
  if (width < 30 || height < 30) {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: color,
            stroke: '#fff',
            strokeWidth: 2,
            strokeOpacity: 1
          }}
        />
      </g>
    );
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          stroke: '#fff',
          strokeWidth: 2,
          strokeOpacity: 1
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - 7}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontSize: width < 50 ? '10px' : width < 100 ? '12px' : '14px',
          fontWeight: 'bold',
          fill: getContrastText(color || '#000000'),
          pointerEvents: 'none',
        }}
      >
        {name}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontSize: '10px',
          fill: getContrastText(color || '#000000'),
          pointerEvents: 'none',
        }}
      >
        {payload && payload.revenue_percentage ? formatPercent(payload.revenue_percentage) : ""}
      </text>
    </g>
  );
};

// Interface pour les props du tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

// Composant pour afficher un tooltip personnalisé
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white dark:bg-gray-800 p-4 shadow-lg rounded-md border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-white mb-1">{data.name}</p>
        <p className="text-gray-600 dark:text-gray-300 mb-1">
          CA: {formatCurrency(data.value)}
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-1">
          Part: {formatPercent(data.revenue_percentage)}
        </p>
        <p className="text-emerald-600 dark:text-emerald-400 mb-1">
          Marge: {formatCurrency(data.margin)} ({formatPercent(data.margin_percentage)})
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          Quantité: {data.quantity.toLocaleString('fr-FR')}
        </p>
      </div>
    );
  }
  
  return null;
};

const UniverseTreemap: React.FC = () => {
  const { data, isLoading, error } = useSalesByUniverse();
  const [sortBy, setSortBy] = useState<'revenue' | 'margin'>('revenue');
  
  // État de chargement
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
        <div className="flex justify-between mb-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-80"></div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4 text-red-500 dark:text-red-400">
          <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 mr-3">
            <FiBarChart2 size={20} />
          </div>
          <h3 className="text-lg font-medium">Erreur de chargement des données</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{error}</p>
      </div>
    );
  }

  // Vérifier que les données existent
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4 text-yellow-500">
          <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300 mr-3">
            <FiBarChart2 size={20} />
          </div>
          <h3 className="text-lg font-medium">Aucune donnée disponible</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Aucune donnée de vente par univers n&apos;est disponible pour la période sélectionnée.
        </p>
      </div>
    );
  }

  const formattedData = formatDataForTreemap(data);
  
  // Trier les données selon le critère sélectionné
  const sortedData = [...formattedData].sort((a, b) => {
    if (sortBy === 'margin') {
      return b.margin - a.margin;
    }
    return b.value - a.value;
  });
  
  // Calculer les totaux
  const totalRevenue = formattedData.reduce((sum, item) => sum + item.value, 0);
  const totalMargin = formattedData.reduce((sum, item) => sum + item.margin, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
            <FiBarChart2 size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Ventes par Univers
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {sortBy === 'revenue' 
                ? `CA Total: ${formatCurrency(totalRevenue)}`
                : `Marge Totale: ${formatCurrency(totalMargin)}`}
              {' • '}{data.length} univers
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setSortBy('revenue')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              sortBy === 'revenue'
                ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Par CA
          </button>
          <button
            onClick={() => setSortBy('margin')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              sortBy === 'margin'
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Par Marge
          </button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={sortedData}
            dataKey={sortBy === 'revenue' ? 'value' : 'margin'}
            aspectRatio={4/3}
            stroke="#fff"
            content={<CustomTreemapContent />}
          >
            <Tooltip 
              content={<CustomTooltip />}
              wrapperStyle={{ zIndex: 100 }}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>

      {/* Légende des univers (affichée pour les 8 premiers univers) */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {sortedData.slice(0, 8).map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-4 h-4 rounded-sm mr-2" 
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {item.name}
            </span>
          </div>
        ))}
        {sortedData.length > 8 && (
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-sm mr-2 bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              +{sortedData.length - 8} autres...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniverseTreemap;