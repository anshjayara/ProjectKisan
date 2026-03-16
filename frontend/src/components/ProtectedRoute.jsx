function ProtectedRoute({ isAuthenticated, fallback = null, children }) {
  if (!isAuthenticated) {
    return fallback;
  }

  return children;
}

export default ProtectedRoute;
