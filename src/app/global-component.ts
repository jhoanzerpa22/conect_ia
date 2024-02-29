export const GlobalComponent = {
    // Api Calling
    API_URL : 'https://api-node.themesbrand.website/',
    //API_URL_BACK : 'https://connect-ia-production.up.railway.app/api/v1/',
    //API_URL_BACK : 'https://connect-ia.onrender.com/api/v1/',
    //API_URL_BACK : 'https://conect-ia-7fc34370c4c9.herokuapp.com/api/v1/',
    API_URL_BACK : 'http://api.conect-ia.com/api/v1/',
    //API_URL_BACK : 'http://localhost:3000/api/v1/',
    //API_URL_BACK : 'http://3.15.30.193:3000/api/v1/',
    headerToken : {'Authorization': `Bearer ${localStorage.getItem('token')}`},

    // Auth Api
    //AUTH_API:"https://api-node.themesbrand.website/auth/",
    //AUTH_API:"https://connect-ia-production.up.railway.app/api/v1/auth/",
    //AUTH_API: "https://connect-ia.onrender.com/api/v1/auth/",
    //AUTH_API : 'https://conect-ia-7fc34370c4c9.herokuapp.com/api/v1/auth/',
    AUTH_API : 'http://api.conect-ia.com/api/v1/auth/',
    //sAUTH_API:"http://localhost:3000/api/v1/auth/",
    //AUTH_API:"http://3.15.30.193:3000/api/v1/auth/",
    
    // Products Api
    product:'apps/product',
    productDelete:'apps/product/',

    // Orders Api
    order:'apps/order',
    orderId:'apps/order/',

    // Customers Api
    customer:'apps/customer',
}