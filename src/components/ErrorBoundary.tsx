import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorLocation: string | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorLocation: null,
    };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const location = this.extractLocation(
      errorInfo?.componentStack ?? undefined
    );

    this.setState({
      error,
      errorInfo,
      errorLocation: location,
    });

    console.error("🔥 Error caught by ErrorBoundary:", error, errorInfo);
  }

  // ✅ Fully TypeScript safe
  extractLocation(
    stack: string | null | undefined
  ): string | null {
    if (!stack) return null;

    // Get first meaningful component
    const match = stack.match(/at\s+([A-Za-z0-9_]+)/);

    return match ? match[1] : null;
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "40px",
            fontFamily: "monospace",
            backgroundColor: "#fff5f5",
            minHeight: "100vh",
          }}
        >
          <h2 style={{ color: "red" }}>
            🚨 ERROR IN:{" "}
            {this.state.errorLocation || "Unknown Component"}
          </h2>

          <p>
            <strong>Error:</strong>{" "}
            {this.state.error?.message || "Unknown error"}
          </p>

          <button
            onClick={this.handleReload}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Reload Application
          </button>

          {process.env.NODE_ENV === "development" && (
            <>
              <h4 style={{ marginTop: "30px" }}>
                Component Stack:
              </h4>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  color: "#cc0000",
                }}
              >
                {this.state.errorInfo?.componentStack}
              </pre>

              <h4>Full Stack:</h4>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {this.state.error?.stack}
              </pre>
            </>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;