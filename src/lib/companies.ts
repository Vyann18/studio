import type { Company, CompanyGroup } from './types';

export const companies: Company[] = [
    {
        id: 'EJY1UT',
        name: 'InventoryFlow Inc.',
        address: '123 ERP Lane, Business City, 54321',
        groupId: 'GRP-01',
    },
    {
        id: 'B3Z9P2',
        name: 'RetailOps Solutions',
        address: '456 Commerce Ave, Market Town, 67890',
        groupId: 'GRP-01',
    },
    {
        id: 'K8D4F7',
        name: 'SoloLogistics',
        address: '789 Supply Chain Rd, Loneberg, 11223',
    }
];

export const companyGroups: CompanyGroup[] = [
    {
        id: 'GRP-01',
        name: 'Global-Wide Enterprises'
    }
];
