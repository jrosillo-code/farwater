import { useEffect, useCallback } from "react";
import { useLocation } from "wouter";

const trackPageView = async (path: string) => {
  try {
    await fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    console.error("Failed to track page view:", error);
  }
};

const trackEvent = async (eventType: string, eventData?: string) => {
  try {
    await fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        eventData: eventData || null,
      }),
    });
  } catch (error) {
    console.error("Failed to track event:", error);
  }
};

export function usePageTracking() {
  const [location] = useLocation();

  useEffect(() => {
    trackPageView(location);
  }, [location]);
}

export function useAnalytics() {
  const trackSubscription = useCallback((email: string) => {
    trackEvent("email_subscription", email);
  }, []);

  const trackContactSubmission = useCallback((inquiryType: string) => {
    trackEvent("contact_form_submission", inquiryType);
  }, []);

  const trackExpeditionView = useCallback((expeditionId: string) => {
    trackEvent("expedition_view", expeditionId);
  }, []);

  const trackFilmPlay = useCallback((filmTitle: string) => {
    trackEvent("film_play", filmTitle);
  }, []);

  const trackStoryView = useCallback((storySlug: string) => {
    trackEvent("story_view", storySlug);
  }, []);

  return {
    trackSubscription,
    trackContactSubmission,
    trackExpeditionView,
    trackFilmPlay,
    trackStoryView,
    trackEvent,
  };
}
