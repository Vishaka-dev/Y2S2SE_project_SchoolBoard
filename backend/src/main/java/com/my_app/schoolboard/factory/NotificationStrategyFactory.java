package com.my_app.schoolboard.factory;

import com.my_app.schoolboard.model.NotificationType;
import com.my_app.schoolboard.strategy.NotificationStrategy;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
public class NotificationStrategyFactory {

    private final Map<NotificationType, NotificationStrategy> strategyByType;

    public NotificationStrategyFactory(List<NotificationStrategy> strategies) {
        this.strategyByType = new EnumMap<>(NotificationType.class);
        for (NotificationStrategy strategy : strategies) {
            this.strategyByType.put(strategy.getSupportedType(), strategy);
        }
    }

    public NotificationStrategy getStrategy(NotificationType type) {
        NotificationStrategy strategy = strategyByType.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("No notification strategy registered for type: " + type);
        }
        return strategy;
    }
}
