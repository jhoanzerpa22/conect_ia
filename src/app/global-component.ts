export const GlobalComponent = {
    // Api Calling
    API_URL : 'https://api-node.themesbrand.website/',
    API_URL_BACK : 'https://connect-ia-production.up.railway.app/api/v1/',
    //API_URL_BACK : 'http://localhost:3000/api/v1/',
    headerToken : {'Authorization': `Bearer ${localStorage.getItem('token')}`},

    // Auth Api
    //AUTH_API:"https://api-node.themesbrand.website/auth/",
    AUTH_API:"https://connect-ia-production.up.railway.app/api/v1/auth/",
    //AUTH_API:"http://localhost:3000/api/v1/auth/",
    
    // Products Api
    product:'apps/product',
    productDelete:'apps/product/',

    // Orders Api
    order:'apps/order',
    orderId:'apps/order/',

    // Customers Api
    customer:'apps/customer',
}