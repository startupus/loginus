import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Icon, Badge } from '../../design-system/primitives';
import { WidgetCard } from '../../design-system/composites/WidgetCard';

export interface PlusWidgetProps {
  active: boolean;
  points: number;
  tasks: number;
}

/**
 * PlusWidget - виджет Яндекс Плюс
 */
export const PlusWidget: React.FC<PlusWidgetProps> = ({
  active,
  points,
  tasks,
}) => {
  return (
    <WidgetCard
      title="Яндекс Плюс"
      icon={<Icon name="plus-coin" size="lg" className="text-primary" />}
      actions={
        <Link to="/plus">
          <Button variant="ghost" size="sm">
            <Icon name="arrow-right" size="sm" />
          </Button>
        </Link>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-body-color dark:text-dark-6 mb-1">
              Статус
            </p>
            {active ? (
              <Badge variant="success" size="sm" className="transition-all duration-200 group-hover:scale-105">
                Активен
              </Badge>
            ) : (
              <Badge variant="secondary" size="sm" className="transition-all duration-200">
                Неактивен
              </Badge>
            )}
          </div>
        </div>
        
        {active && (
          <>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 dark:bg-primary/10 transition-all duration-200 group-hover:bg-primary/10 dark:group-hover:bg-primary/20">
              <div>
                <p className="text-sm text-body-color dark:text-dark-6 mb-1">
                  Баллы
                </p>
                <p className="text-xl font-bold text-dark dark:text-white transition-transform duration-200 group-hover:scale-105">
                  {points.toLocaleString('ru-RU')}
                </p>
              </div>
            </div>
            
            {tasks > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-1 dark:bg-dark-3">
                <div>
                  <p className="text-sm text-body-color dark:text-dark-6 mb-1">
                    Заданий
                  </p>
                  <p className="text-lg font-semibold text-dark dark:text-white">
                    {tasks}
                  </p>
                </div>
                <Link to="/plus/tasks" className="inline-block">
                  <Button variant="ghost" size="sm" className="transition-all duration-200 hover:scale-105 hover:bg-primary/10">
                    Выполнить
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </WidgetCard>
  );
};

