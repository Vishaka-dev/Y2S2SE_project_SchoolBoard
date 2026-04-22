package com.my_app.schoolboard.strategy;

import com.my_app.schoolboard.event.DomainEvent;
import com.my_app.schoolboard.model.NotificationType;

public interface NotificationStrategy {

    NotificationType getSupportedType();

    String generateTitle(DomainEvent event);

    String generateMessage(DomainEvent event);
}
