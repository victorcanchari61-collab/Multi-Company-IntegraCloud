export type SystemIcon =
  | 'layout-grid'
  | 'handshake'
  | 'warehouse'
  | 'network'
  | 'clipboard-list'
  | 'truck'
  | 'id-card'
  | 'shopping-cart'
  | 'recycle'
  | 'badge-check'
  | 'wrench';

export interface SystemDefinition {
  key: string;
  acronym: string;
  description: string;
  icon: SystemIcon;
}

// Sistemas operativos planeados para la plataforma (ver doc/01-operativos/README.md en la raíz
// del workspace). Se van habilitando a medida que se construyen; hoy solo IAM (auth) tiene
// funcionalidad real, el resto es el roadmap. Se usa tanto en el dashboard como en el acceso
// rápido del navbar.
export const SYSTEMS: SystemDefinition[] = [
  { key: 'erp', acronym: 'ERP', description: 'Integra todos los procesos core del negocio en una sola plataforma', icon: 'layout-grid' },
  { key: 'crm', acronym: 'CRM', description: 'Gestiona las relaciones con clientes a lo largo del ciclo de vida', icon: 'handshake' },
  { key: 'wms', acronym: 'WMS', description: 'Controla y optimiza las operaciones dentro del almacén', icon: 'warehouse' },
  { key: 'scm', acronym: 'SCM', description: 'Coordina el flujo de bienes, información y finanzas en la cadena de suministro', icon: 'network' },
  { key: 'mrp', acronym: 'MRP', description: 'Calcula los materiales necesarios para la producción', icon: 'clipboard-list' },
  { key: 'tms', acronym: 'TMS', description: 'Gestiona la planificación, ejecución y optimización del transporte', icon: 'truck' },
  { key: 'hrm', acronym: 'HRM', description: 'Administra todos los procesos relacionados con el capital humano', icon: 'id-card' },
  { key: 'pos', acronym: 'POS', description: 'Gestiona las transacciones de venta en el punto de contacto con el cliente', icon: 'shopping-cart' },
  { key: 'plm', acronym: 'PLM', description: 'Gestiona el ciclo de vida completo del producto', icon: 'recycle' },
  { key: 'qms', acronym: 'QMS', description: 'Asegura que productos y procesos cumplan estándares de calidad', icon: 'badge-check' },
  { key: 'eam', acronym: 'EAM', description: 'Gestiona el ciclo de vida de los activos físicos', icon: 'wrench' },
];
