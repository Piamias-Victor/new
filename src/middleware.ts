// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Liste des chemins d'API qui nécessitent une vérification d'accès par pharmacie
const pharmacyRestrictedPaths = [
    '/api/admin',
];

export async function middleware(req: NextRequest) {
  // Vérifier si c'est une requête API qui nécessite un contrôle
  const path = req.nextUrl.pathname;
  
  // Si ce n'est pas un chemin restreint, continuer
  if (!pharmacyRestrictedPaths.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith('/api/')) {
    // Continuer avec la requête, mais modifier la réponse ensuite
    const response = NextResponse.next();
    
    // Ajouter les en-têtes de cache
    response.headers.set('Cache-Control', 'public, max-age=120, s-maxage=120, stale-while-revalidate=60');
    
    return response;
  }
  
  // Récupérer le token de session
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // Si pas de token, renvoyer une erreur 401
  if (!token) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    );
  }
  
  // Si c'est un admin, permettre l'accès complet
  if (token.role === 'admin') {
    return NextResponse.next();
  }
  
  // Pour les utilisateurs de pharmacie, vérifier l'ID de pharmacie dans la requête
  if (token.role === 'pharmacy_user') {
    const searchParams = req.nextUrl.searchParams;
    const pharmacyId = searchParams.get('pharmacyId') || searchParams.get('pharmacyIds');
    
    // Extraire les pharmacyIds du corps pour les requêtes POST/PUT
    let bodyPharmacyIds: string[] = [];
    if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
      try {
        const body = await req.json();
        // Cloner la requête pour ne pas la consommer
        const clonedReq = req.clone();
        req = clonedReq;
        
        bodyPharmacyIds = body.pharmacyIds || (body.pharmacyId ? [body.pharmacyId] : []);
      } catch (error) {
        console.error('Error parsing request body in middleware:', error);
      }
    }
    
    // Extraire les IDs de pharmacie de l'URL
    // Format possible: pharmacyId=123 ou pharmacyIds=123,456
    const urlPharmacyIds = pharmacyId 
      ? pharmacyId.split(',').filter(Boolean)
      : [];
      
    const allPharmacyIds = [...urlPharmacyIds, ...bodyPharmacyIds];
    
    // Si aucun ID de pharmacie n'est spécifié ou si l'utilisateur tente d'accéder
    // à une pharmacie qui n'est pas la sienne
    if (
      allPharmacyIds.length > 0 && 
      !allPharmacyIds.includes(token.pharmacyId) &&
      !allPharmacyIds.includes('all') // Exception pour 'all' si utilisé dans votre API
    ) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette pharmacie' },
        { status: 403 }
      );
    }
    
    // Si aucun ID de pharmacie n'est spécifié, forcer l'utilisation de sa propre pharmacie
    if (allPharmacyIds.length === 0) {
      // Cloner l'URL et ajouter le paramètre pharmacyId
      const url = req.nextUrl.clone();
      url.searchParams.set('pharmacyId', token.pharmacyId);
      
      // Rediriger vers la nouvelle URL avec le pharmacyId ajouté
      return NextResponse.rewrite(url);
    }
  }
  
  // Continuer pour tous les autres cas
  return NextResponse.next();
}

// Définir les chemins où le middleware doit s'exécuter
export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*'
  ],
};