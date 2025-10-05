
import { Head as InertiaHead } from '@inertiajs/react';

export const Head = ({ title }) => {
    return (
        <InertiaHead>
            <title>{title ? `${title} - ERP System` : 'ERP System'}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
        </InertiaHead>
    );                              
};
