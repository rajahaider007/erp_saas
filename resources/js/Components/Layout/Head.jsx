
export const Head = ({ title }) => {
    return (
        <head>
        <title>{title ? `${title} - ERP System` : 'ERP System'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="/css/app.css" />
        </head>
    );                              
};
