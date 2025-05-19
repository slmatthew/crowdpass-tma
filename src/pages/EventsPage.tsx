import { DuckedError } from "@/components/DuckedError";
import { LoadingPage } from "@/components/LoadingPage";
import { Page } from "@/components/Page";
import { appConfig } from "@/config/appConfig";
import { publicUrl } from "@/helpers/publicUrl";
import { useApiClient } from "@/hooks/useApiClient";
import { EventsResponse } from "@/types/api/EventsResponse";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Badge, Button, Caption, Card, List, Title } from "@telegram-apps/telegram-ui";
import dayjs from "dayjs";
import React from "react";
import { FC, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export const EventsPage: FC = () => {
  const api = useApiClient();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['events'],
    initialPageParam: 0,
    queryFn: ({ pageParam = 0 }) =>
      api.get<EventsResponse>('events/', {
        params: { skip: pageParam, take: appConfig.pageSize }
      }).then(res => res.data),
    getNextPageParam: (lastPage, pages) => {
      const loadedItems = pages.flatMap(p => p.events).length;
      console.log('Loaded items:', loadedItems, '/', lastPage.totalCount);

      return loadedItems < lastPage.totalCount ? loadedItems : undefined;
    },
    staleTime: 1000 * 60 * 5,
  });


  const flatEvents = data?.pages.flatMap(page => page.events) ?? [];

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    });

    const el = containerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasNextPage, isFetchingNextPage]);

  function handleIntersect(entries: IntersectionObserverEntry[]) {
    if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }

  if(isLoading) return <LoadingPage />;

  if(flatEvents.length === 0) return <DuckedError
    description="Возвращайтесь позже – они обязательно появятся"
    header="Мероприятий нет"
    tgsUrl={publicUrl('/duck2.tgs')}
  />;

  return (
    <Page>
      <List>
        <section style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Title weight="2" onClick={() => fetchNextPage()}>Мероприятия</Title>
        </section>
        <section style={{ maxWidth: '100%', overflow: 'hidden' }}>
          {flatEvents.map((event) => {
            const soon = new Date(event.startDate).getTime() - Date.now() < 24 * 60 * 60 * 1000;

            return (
              <Card
                key={event.id}
                style={{ minWidth: '100%', marginBottom: '.5rem' }}
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <React.Fragment key=".0">
                  {soon && (
                    <Card.Chip readOnly>СКОРО! 🔥</Card.Chip>
                  )}
                  <div
                    style={{
                      width: '100%',
                      maxHeight: '100%',
                      margin: '0 auto',
                      aspectRatio: '16 / 9',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      alt={event.name}
                      src={event.posterUrl || appConfig.placeholderSrc}
                      style={{
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                  <Card.Cell
                    readOnly
                    multiline={true}
                    description={event.description}
                    subtitle={`${dayjs(event.startDate).format('DD.MM.YYYY в HH:mm')}`}
                    titleBadge={soon ? <Badge type="dot" mode="critical" /> : undefined}
                  >
                    {event.name}
                  </Card.Cell>
                  {event.prices.min && (
                    <Card.Cell
                      readOnly
                      multiline={true}
                    >
                      Билеты от {event.prices.min}₽ 🔥
                    </Card.Cell>
                  )}
                </React.Fragment>
              </Card>
            );
          })}
          {hasNextPage && <Button onClick={() => fetchNextPage()} mode="gray" stretched>Показать ещё</Button>}
        </section>
        {!hasNextPage && <Caption style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', marginBottom: 'var(--sfx-modal-padding)' }}>Конец</Caption>}
        <div ref={containerRef} />
      </List>
    </Page>
  );
};